import { contracts } from "@polkadot-api/descriptors";
import { defineContract } from "@reactive-dot/core";
import { useLazyLoadQuery } from "@reactive-dot/react";

export function Contracts() {
  return (
    <Psp22TokenInfo address="16dg7W38UBuVZQMZkTVYmYPLuaFQ3bfE9ZLS4jAeKJzC2E7d" />
  );
}

const psp22 = defineContract({ descriptor: contracts.psp22 });

type Psp22TokenInfoProps = {
  address: string;
};

export function Psp22TokenInfo({ address }: Psp22TokenInfoProps) {
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
  );
}
