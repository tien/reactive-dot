import { config } from "./config";
import {
  idle,
  MutationError,
  pending,
  type PolkadotAccount,
} from "@reactive-dot/core";
import type { Wallet } from "@reactive-dot/core/wallets.js";
import {
  ReDotChainProvider,
  ReDotProvider,
  useAccounts,
  useBlock,
  useConnectedWallets,
  useLazyLoadQuery,
  useLazyLoadQueryWithRefresh,
  useMutation,
  useMutationEffect,
  useNativeTokenAmountFromPlanck,
  useQueryErrorResetter,
  useSpendableBalance,
  useWalletConnector,
  useWalletDisconnector,
  useWallets,
} from "@reactive-dot/react";
import { formatDistance } from "date-fns";
import { DevTools } from "jotai-devtools";
import { Binary } from "polkadot-api";
import { Suspense, useState, useTransition } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import toast, { Toaster } from "react-hot-toast";

type PendingRewardsProps = {
  account: PolkadotAccount;
  rewards: bigint;
};

function PendingRewards({ account, rewards }: PendingRewardsProps) {
  return (
    <li>
      {account.name ?? account.address}:{" "}
      {useNativeTokenAmountFromPlanck(rewards).toLocaleString()}
    </li>
  );
}

function PendingPoolRewards() {
  const accounts = useAccounts();

  const [isPending, startTransition] = useTransition();
  const [pendingRewards, refreshPendingRewards] = useLazyLoadQueryWithRefresh(
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
      <button
        type="button"
        onClick={() => startTransition(() => refreshPendingRewards())}
      >
        {isPending ? "Refreshing..." : "Refresh"}
      </button>
      <ul>
        {pendingRewards.map((rewards, index) => (
          <PendingRewards
            // eslint-disable-next-line @eslint-react/no-array-index-key
            key={index}
            account={accounts.at(index)!}
            rewards={rewards}
          />
        ))}
      </ul>
    </article>
  );
}

type SpendableBalanceProps = {
  account: PolkadotAccount;
};

function SpendableBalance({ account }: SpendableBalanceProps) {
  return (
    <li>
      {account.name ?? account.address}:{" "}
      {useSpendableBalance(account.address).toLocaleString()}
    </li>
  );
}

function SpendableBalances() {
  const accounts = useAccounts();

  if (accounts.length === 0) {
    return (
      <article>
        <h4>Balances</h4>
        <p>Please connect accounts to see balances</p>
      </article>
    );
  }

  return (
    <article>
      <h4>Spendable balances</h4>
      <ul>
        {accounts.map((account) => (
          <SpendableBalance
            key={account.wallet.id + account.address}
            account={account}
          />
        ))}
      </ul>
    </article>
  );
}

function Query() {
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
  ] = useLazyLoadQuery((builder) =>
    builder
      .getConstant("Babe", "ExpectedBlockTime")
      .getConstant("Babe", "EpochDuration")
      .getConstant("Staking", "SessionsPerEra")
      .getConstant("Staking", "BondingDuration")
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

  const totalStaked = useLazyLoadQuery((builder) =>
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
        <p>{useNativeTokenAmountFromPlanck(totalIssuance).toLocaleString()}</p>
      </article>
      <article>
        <h4>Bonding duration</h4>
        <p>{formatDistance(0, bondingDurationMs)}</p>
      </article>
      <article>
        <h4>Total value staked</h4>
        <p>
          {useNativeTokenAmountFromPlanck(
            typeof totalStaked === "bigint" ? totalStaked : 0n,
          ).toLocaleString()}
        </p>
      </article>
      <article>
        <h4>Total value locked in nomination Pools</h4>
        <p>
          {useNativeTokenAmountFromPlanck(totalValueLocked).toLocaleString()}
        </p>
      </article>
      <article>
        <h4>First 4 pools</h4>
        {poolMetadatum.map((x, index) => (
          // eslint-disable-next-line @eslint-react/no-array-index-key
          <p key={index}>{x.asText()}</p>
        ))}
      </article>
      <SpendableBalances />
      <PendingPoolRewards />
    </section>
  );
}

type WalletItemProps = {
  wallet: Wallet;
};

function WalletItem({ wallet }: WalletItemProps) {
  const connectedWallets = useConnectedWallets();

  const [connectingState, connect] = useWalletConnector(wallet);
  const [disconnectingState, disconnect] = useWalletDisconnector(wallet);

  return (
    <li>
      {wallet.name}:{" "}
      {connectedWallets.includes(wallet) ? (
        <button
          type="button"
          onClick={() => disconnect()}
          disabled={disconnectingState === pending}
        >
          Disconnect{disconnectingState === pending && <>...</>}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => connect()}
          disabled={connectingState === pending}
        >
          Connect{connectingState === pending && <>...</>}
        </button>
      )}
    </li>
  );
}

function WalletConnection() {
  const wallets = useWallets();

  return (
    <section>
      <header>
        <h3>Wallet connection</h3>
      </header>
      <article>
        <h4>Wallets</h4>
        <ul>
          {wallets.map((wallet) => (
            <WalletItem key={wallet.id} wallet={wallet} />
          ))}
        </ul>
      </article>
    </section>
  );
}

function Mutation() {
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
              // eslint-disable-next-line @eslint-react/no-array-index-key
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
          <button
            type="button"
            onClick={() => remark()}
            disabled={accounts.length === 0}
          >
            Hello
          </button>
          <p>
            {(() => {
              switch (remarkState) {
                case idle:
                  return null;
                case pending:
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
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <article>
      <header>
        <strong>Oops, something went wrong!</strong>
      </header>
      <button type="button" onClick={() => resetErrorBoundary(error)}>
        Retry
      </button>
    </article>
  );
}

type ExampleProps = { chainName: string };

function Example({ chainName }: ExampleProps) {
  const resetQueryError = useQueryErrorResetter();

  useMutationEffect((event) => {
    if (event.value === pending) {
      toast.loading("Submitting transaction", { id: event.id });
      return;
    }

    if (event.value instanceof MutationError) {
      toast.error("Failed to submit transaction", { id: event.id });
      return;
    }

    switch (event.value.type) {
      case "finalized":
        if (event.value.ok) {
          toast.success("Submitted transaction", { id: event.id });
        } else {
          toast.error("Transaction failed", { id: event.id });
        }
        break;
      default:
        toast.loading("Transaction pending", { id: event.id });
    }
  });

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
        <Suspense fallback={<h2>Loading {chainName}...</h2>}>
          <h2>{chainName}</h2>
          <Query />
          <Mutation />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export function App() {
  return (
    <ReDotProvider config={config}>
      <Suspense fallback="Loading wallet connection...">
        <WalletConnection />
      </Suspense>
      <ReDotChainProvider chainId="polkadot">
        <Example chainName="Polkadot" />
      </ReDotChainProvider>
      <ReDotChainProvider chainId="kusama">
        <Example chainName="Kusama" />
      </ReDotChainProvider>
      <ReDotChainProvider chainId="westend">
        <Example chainName="Westend" />
      </ReDotChainProvider>
      <Toaster />
      <DevTools />
    </ReDotProvider>
  );
}
