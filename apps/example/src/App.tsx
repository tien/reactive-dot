import config from "./config";
import { IDLE, MutationError, PENDING } from "@reactive-dot/core";
import {
  ReDotChainProvider,
  ReDotProvider,
  useResetQueryError,
  useAccounts,
  useBlock,
  useConnectedWallets,
  useMutation,
  useQuery,
  useQueryWithRefresh,
  useWallets,
} from "@reactive-dot/react";
import { formatDistance } from "date-fns";
import { Binary } from "polkadot-api";
import { Suspense, useState, useTransition } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

const PendingPoolRewards = () => {
  const accounts = useAccounts();

  const [isPending, startTransition] = useTransition();
  const [pendingRewards, refreshPendingRewards] = useQueryWithRefresh(
    (builder) =>
      builder.callApis(
        "NominationPoolsApi",
        "pending_rewards",
        accounts.map((account) => [account.address] as const),
      ),
  );

  if (accounts.length === 0) {
    return (
      <article>
        <h4>Pending rewards</h4>
        <p>Please connect accounts to see pending rewards</p>
      </article>
    );
  }

  return (
    <article>
      <h4>Pending rewards</h4>
      <button onClick={() => startTransition(() => refreshPendingRewards())}>
        {isPending ? "Refreshing..." : "Refresh"}
      </button>
      <ul>
        {pendingRewards.map((rewards, index) => (
          <li key={index}>
            {accounts.at(index)?.address}: {rewards.toLocaleString()} planck
          </li>
        ))}
      </ul>
    </article>
  );
};

const Query = () => {
  const block = useBlock();

  const [
    expectedBlockTime,
    epochDuration,
    sessionsPerEra,
    bondingDuration,
    timestamp,
    totalIssuance,
    activeEra,
    totalValueLocked,
    poolMetadatum,
  ] = useQuery((builder) =>
    builder
      .fetchConstant("Babe", "ExpectedBlockTime")
      .fetchConstant("Babe", "EpochDuration")
      .fetchConstant("Staking", "SessionsPerEra")
      .fetchConstant("Staking", "BondingDuration")
      .readStorage("Timestamp", "Now", [])
      .readStorage("Balances", "TotalIssuance", [])
      .readStorage("Staking", "ActiveEra", [])
      .readStorage("NominationPools", "TotalValueLocked", [])
      .readStorages("NominationPools", "Metadata", [[0], [1], [2], [3], [4]]),
  );

  const bondingDurationMs =
    Number(expectedBlockTime) *
    Number(epochDuration) *
    sessionsPerEra *
    bondingDuration;

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
          {block.number} @ {new Date(Number(timestamp)).toLocaleString()}
        </p>
      </article>
      <article>
        <h4>Active era</h4>
        <p>{activeEra?.index}</p>
      </article>
      <article>
        <h4>Total issuance</h4>
        <p>{totalIssuance.toLocaleString()} planck</p>
      </article>
      <article>
        <h4>Bonding duration</h4>
        <p>{formatDistance(0, bondingDurationMs)}</p>
      </article>
      <article>
        <h4>Total value staked</h4>
        <p>{totalStaked?.toLocaleString()} planck</p>
      </article>
      <article>
        <h4>Total value locked in nomination Pools</h4>
        <p>{totalValueLocked.toLocaleString()} planck</p>
      </article>
      <article>
        <h4>First 4 pools</h4>
        {poolMetadatum.map((x, index) => (
          <p key={index}>{x.asText()}</p>
        ))}
      </article>
      <PendingPoolRewards />
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
                {account.name ?? account.address}
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

const ErrorFallback = (props: FallbackProps) => (
  <article>
    <header>
      <strong>Oops, something went wrong!</strong>
    </header>
    <button onClick={() => props.resetErrorBoundary(props.error)}>Retry</button>
  </article>
);

type ExampleProps = { chainName: string };

const Example = (props: ExampleProps) => {
  const resetQueryError = useResetQueryError();

  return (
    <div>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={(details) => {
          if (details.reason === "imperative-api") {
            const [error] = details.args;
            resetQueryError(error);
          }
        }}
      >
        <Suspense fallback={<h2>Loading {props.chainName}...</h2>}>
          <h2>{props.chainName}</h2>
          <Query />
          <Mutation />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

const App = () => (
  <ReDotProvider config={config}>
    <Suspense fallback="Loading wallet connection...">
      <WalletConnection />
    </Suspense>
    <ReDotChainProvider chainId="polkadot">
      <Example chainName="Polkadot" />
    </ReDotChainProvider>
    <ReDotChainProvider chainId="kusama">
      <Suspense fallback={<h2>Loading Kusama...</h2>}>
        <Example chainName="Kusama" />
      </Suspense>
    </ReDotChainProvider>
    <ReDotChainProvider chainId="westend">
      <Suspense fallback={<h2>Loading Westend...</h2>}>
        <Example chainName="Westend" />
      </Suspense>
    </ReDotChainProvider>
  </ReDotProvider>
);

export default App;
