import { kusama, polkadot, westend } from "@polkadot-api/descriptors";
import { IDLE, MutationError, PENDING } from "@reactive-dot/core";
import { InjectedConnector } from "@reactive-dot/core/wallets.js";
import {
  ReDotChainProvider,
  ReDotProvider,
  useAccounts,
  useConnectedWallets,
  useMutation,
  useQuery,
  useWallets,
} from "@reactive-dot/react";
import { Config } from "@reactive-dot/types";
import { Binary } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { startFromWorker } from "polkadot-api/smoldot/from-worker";
import { Suspense, useMemo, useState } from "react";

const Query = () => {
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

  return (
    <section>
      <header>
        <h3>Query</h3>
      </header>
      <article>
        <h4>Current block</h4>
        <p>
          {currentBlock} @ {new Date(Number(timestamp)).toLocaleString()}
        </p>
      </article>
      <article>
        <h4>Active era</h4>
        <p>{activeEra?.index}</p>
      </article>
      <article>
        <h4>Total issuance</h4>
        <p>{totalIssuance.toString()} planck</p>
      </article>
      <article>
        <h4>Total value staked</h4>
        <p>{totalStaked?.toString()} planck</p>
      </article>
      <article>
        <h4>Total value locked in nomination Pools</h4>
        <p>{totalValueLocked.toString()} planck</p>
      </article>
      <article>
        <h4>First 4 pools</h4>
        {poolMetadatum.map((x, index) => (
          <p key={index}>{x.asText()}</p>
        ))}
      </article>
    </section>
  );
};

const WalletConnection = () => {
  const wallets = useWallets();
  const connectedWallets = useConnectedWallets();

  return (
    <section>
      <header>
        <h3>Wallet connection</h3>
      </header>
      <article>
        <h4>Wallets</h4>
        <ul>
          {wallets.map((wallet) => (
            <li key={wallet.id}>
              {wallet.name}:{" "}
              {connectedWallets.includes(wallet) ? (
                <button onClick={() => wallet.disconnect()}>Disconnect</button>
              ) : (
                <button onClick={() => wallet.connect()}>Connect</button>
              )}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};

const Mutation = () => {
  const connectedWallets = useConnectedWallets();

  const accounts = useAccounts();
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const selectedAccount =
    selectedAccountIndex === undefined
      ? undefined
      : accounts.at(selectedAccountIndex);

  const [remarkState, remark] = useMutation(
    (tx) =>
      tx.System.remark({ remark: Binary.fromText("Hello from reactive-dot!") }),
    { signer: selectedAccount?.polkadotSigner },
  );

  return (
    <section>
      <header>
        <h3>Mutation</h3>
      </header>
      {connectedWallets.length === 0 ? (
        <p>Please connect a wallet</p>
      ) : (
        <article>
          <h4>Signer</h4>
          <select
            value={selectedAccountIndex}
            onChange={(event) =>
              setSelectedAccountIndex(Number(event.target.value))
            }
          >
            {accounts.map((account, index) => (
              <option key={index} value={index}>
                {account.name}
              </option>
            ))}
          </select>
        </article>
      )}
      {connectedWallets.length === 0 ? null : selectedAccount === undefined ? (
        <p>Please select an account</p>
      ) : (
        <article>
          <h4>Remark</h4>
          <button onClick={() => remark()} disabled={accounts.length === 0}>
            Hello
          </button>
          <p>
            {(() => {
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
            })()}
          </p>
        </article>
      )}
    </section>
  );
};

const Example = () => (
  <div>
    <Query />
    <Mutation />
  </div>
);

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
  wallets: [new InjectedConnector()],
};

const App = () => (
  <ReDotProvider config={config}>
    <Suspense fallback="Loading wallet connection...">
      <WalletConnection />
    </Suspense>
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
