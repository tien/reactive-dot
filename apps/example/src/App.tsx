import { kusama, polkadot, westend } from "@polkadot-api/descriptors";
import { IDLE, MutationError, PENDING } from "@reactive-dot/core";
import {
  ReDotChainProvider,
  ReDotProvider,
  useMutation,
  useQuery,
} from "@reactive-dot/react";
import { Config } from "@reactive-dot/types";
import { Binary } from "polkadot-api";
import {
  InjectedPolkadotAccount,
  connectInjectedExtension,
  getInjectedExtensions,
} from "polkadot-api/pjs-signer";
import { getSmProvider } from "polkadot-api/sm-provider";
import { startFromWorker } from "polkadot-api/smoldot/from-worker";
import { Suspense, useEffect, useMemo, useState } from "react";

const useInjectedAccounts = () => {
  const [accounts, setAccounts] = useState<InjectedPolkadotAccount[]>([]);

  useEffect(() => {
    const extensions = getInjectedExtensions();
    const firstExtension = extensions?.at(0);

    if (firstExtension === undefined) {
      return;
    }

    const unsubscribePromise = connectInjectedExtension(firstExtension).then(
      (extension) => extension.subscribe(setAccounts),
    );

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe());
    };
  }, []);

  return accounts;
};

const Example = () => {
  const [
    currentBlock,
    timestamp,
    totalIssuance,
    activeEra,
    totalValueLocked,
    poolMetadatum,
  ] = useQuery((builder) =>
    builder
      .readStorage("System", "Number", [])
      .readStorage("Timestamp", "Now", [])
      .readStorage("Balances", "TotalIssuance", [])
      .readStorage("Staking", "ActiveEra", [])
      .readStorage("NominationPools", "TotalValueLocked", [])
      .readStorages("NominationPools", "Metadata", [[0], [1], [2], [3], [4]]),
  );

  const totalStaked = useQuery((builder) =>
    activeEra === undefined
      ? undefined
      : builder.readStorage("Staking", "ErasTotalStake", [activeEra.index]),
  );

  const accounts = useInjectedAccounts();

  const [remarkState, remark] = useMutation(
    (tx) =>
      tx.System.remark({ remark: Binary.fromText("Hello from reactive-dot!") }),
    { chainId: "polkadot", signer: accounts.at(0)?.polkadotSigner },
  );

  return (
    <div>
      <article>
        <h3>Current block</h3>
        <p>
          {currentBlock} @ {new Date(Number(timestamp)).toLocaleString()}
        </p>
      </article>
      <article>
        <h3>Active era</h3>
        <p>{activeEra?.index}</p>
      </article>
      <article>
        <h3>Total issuance</h3>
        <p>{totalIssuance.toString()} planck</p>
      </article>
      <article>
        <h3>Total value staked</h3>
        <p>{totalStaked?.toString()} planck</p>
      </article>
      <article>
        <h3>Total value locked in nomination Pools</h3>
        <p>{totalValueLocked.toString()} planck</p>
      </article>
      <article>
        <h3>First 4 pools</h3>
        {poolMetadatum.map((x, index) => (
          <p key={index}>{x.asText()}</p>
        ))}
      </article>
      <article>
        <h3>Remark</h3>
        <button onClick={() => remark()} disabled={accounts.length === 0}>
          Hello
        </button>
        <p>
          {useMemo(() => {
            switch (remarkState) {
              case IDLE:
                return null;
              case PENDING:
                return "Submitting transaction...";
              default:
                if (remarkState instanceof MutationError) {
                  return "Error submitting transaction";
                }

                return (
                  <span>
                    Submitted tx {remarkState.txHash} is {remarkState.type}
                  </span>
                );
            }
          }, [remarkState])}
        </p>
      </article>
    </div>
  );
};

const createSmoldotWorker = () =>
  new Worker(new URL("polkadot-api/smoldot/worker", import.meta.url), {
    type: "module",
  });

const config: Config = {
  chains: {
    polkadot: {
      descriptor: polkadot,
      provider: getSmProvider(
        import("polkadot-api/chains/polkadot").then(({ chainSpec }) =>
          startFromWorker(createSmoldotWorker()).addChain({ chainSpec }),
        ),
      ),
    },
    kusama: {
      descriptor: kusama,
      provider: getSmProvider(
        import("polkadot-api/chains/ksmcc3").then(({ chainSpec }) =>
          startFromWorker(createSmoldotWorker()).addChain({ chainSpec }),
        ),
      ),
    },
    westend: {
      descriptor: westend,
      provider: getSmProvider(
        import("polkadot-api/chains/westend2").then(({ chainSpec }) =>
          startFromWorker(createSmoldotWorker()).addChain({ chainSpec }),
        ),
      ),
    },
  },
};

const App = () => (
  <ReDotProvider config={config}>
    <ReDotChainProvider chainId="polkadot">
      <Suspense fallback={<h2>Loading Polkadot...</h2>}>
        <h2>Polkadot</h2>
        <Example />
      </Suspense>
    </ReDotChainProvider>
    <ReDotChainProvider chainId="kusama">
      <Suspense fallback={<h2>Loading Kusama...</h2>}>
        <h2>Kusama</h2>
        <Example />
      </Suspense>
    </ReDotChainProvider>
    <ReDotChainProvider chainId="westend">
      <Suspense fallback={<h2>Loading Westend...</h2>}>
        <h2>Westend</h2>
        <Example />
      </Suspense>
    </ReDotChainProvider>
  </ReDotProvider>
);

export default App;
