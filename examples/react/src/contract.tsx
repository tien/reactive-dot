import { AccountSelect } from "./account-select.js";
import { flipper, psp22 } from "./config.js";
import { pending } from "@reactive-dot/core";
import {
  SignerProvider,
  useContractMutation,
  useLazyLoadQuery,
} from "@reactive-dot/react";
import { useEffect, useState, useTransition } from "react";

export function Contracts() {
  return (
    <section>
      <Psp22TokenInfo address="16dg7W38UBuVZQMZkTVYmYPLuaFQ3bfE9ZLS4jAeKJzC2E7d" />
      <Flipper address="14MRHYDcgWmeEsJbfjvjrnyeDrTaF1pAK4UkQEbAyDvP2UqF" />
    </section>
  );
}

type ContractProps = {
  address: string;
};

function Psp22TokenInfo({ address }: ContractProps) {
  const [timestamp, [tokenName, tokenDecimals, tokenSymbol, totalSupply]] =
    useLazyLoadQuery(
      (builder) =>
        builder
          .storage("Timestamp", "Now")
          .contract(psp22, address, (builder) =>
            builder
              .message("PSP22Metadata::token_name")
              .message("PSP22Metadata::token_decimals")
              .message("PSP22Metadata::token_symbol")
              .message("PSP22::total_supply"),
          ),
      { chainId: "pop_testnet" },
    );

  return (
    <article>
      <h3>PSP22</h3>
      <dl>
        <dt>Timestamp</dt>
        <dd>{new Date(Number(timestamp)).toLocaleString()}</dd>

        <dt>Token name</dt>
        <dd>{tokenName ?? "N/A"}</dd>

        <dt>Token symbol</dt>
        <dd>{tokenSymbol}</dd>

        <dt>Token decimals</dt>
        <dd>{tokenDecimals}</dd>

        <dt>Total supply</dt>
        <dd>{totalSupply.toLocaleString()}</dd>
      </dl>
    </article>
  );
}

function Flipper({ address }: ContractProps) {
  const [inTransition, startTransition] = useTransition();
  const [fetchKey, setFetchKey] = useState(0);

  const flipped = useLazyLoadQuery(
    (builder) =>
      builder.contract(flipper, address, (builder) => builder.message("get")),
    { chainId: "pop_testnet", fetchKey },
  );

  return (
    <article>
      <h3>Flipper</h3>
      <p>
        Flipped: {flipped ? "true" : "false"} {inTransition && `(updating)`}
      </p>
      <AccountSelect>
        {(selectedAccount) => (
          <SignerProvider signer={selectedAccount.polkadotSigner}>
            <Flip
              address={address}
              onFlipped={() =>
                startTransition(() => setFetchKey((count) => count + 1))
              }
            />
          </SignerProvider>
        )}
      </AccountSelect>
    </article>
  );
}

type FlipProps = ContractProps & {
  onFlipped: () => void;
};

function Flip({ address, onFlipped }: FlipProps) {
  const [flipStatus, flip] = useContractMutation(
    (mutate) => mutate(flipper, address, "flip", {}),
    { chainId: "pop_testnet" },
  );

  useEffect(() => {
    if (
      typeof flipStatus !== "symbol" &&
      !(flipStatus instanceof Error) &&
      flipStatus.type === "txBestBlocksState"
    ) {
      onFlipped();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipStatus]);

  return (
    <button
      type="button"
      onClick={() => flip()}
      disabled={flipStatus === pending}
    >
      {flipStatus === pending ? "Flipping" : "Flip"}
    </button>
  );
}
