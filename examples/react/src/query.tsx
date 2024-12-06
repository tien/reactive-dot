import type { PolkadotAccount } from "@reactive-dot/core/wallets.js";
import {
  useAccounts,
  useBlock,
  useQuery,
  useQueryWithRefresh,
  useNativeTokenAmountFromPlanck,
  useSpendableBalance,
} from "@reactive-dot/react";
import { formatDistance } from "date-fns";
import { use, useTransition } from "react";

export function Query() {
  const block = use(useBlock());

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
  ] = use(
    useQuery((builder) =>
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
    ),
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
        <p>
          {use(useNativeTokenAmountFromPlanck(totalIssuance)).toLocaleString()}
        </p>
      </article>
      <article>
        <h4>Bonding duration</h4>
        <p>{formatDistance(0, bondingDurationMs)}</p>
      </article>
      <article>
        <h4>Total value staked</h4>
        <p>
          {use(
            useNativeTokenAmountFromPlanck(
              typeof totalStaked === "bigint" ? totalStaked : 0n,
            ),
          ).toLocaleString()}
        </p>
      </article>
      <article>
        <h4>Total value locked in nomination Pools</h4>
        <p>
          {use(
            useNativeTokenAmountFromPlanck(totalValueLocked),
          ).toLocaleString()}
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

function SpendableBalances() {
  const accounts = use(useAccounts());

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
            key={account.wallet.id + account.id}
            account={account}
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
      {use(useSpendableBalance(account.address)).toLocaleString()}
    </li>
  );
}

function PendingPoolRewards() {
  const accounts = use(useAccounts());

  const [isPending, startTransition] = useTransition();
  const [pendingRewardsPromise, refreshPendingRewards] = useQueryWithRefresh(
    (builder) =>
      builder.callApis(
        "NominationPoolsApi",
        "pending_rewards",
        accounts.map((account) => [account.address] as const),
      ),
  );
  const pendingRewards = use(pendingRewardsPromise);

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

type PendingRewardsProps = {
  account: PolkadotAccount;
  rewards: bigint;
};

function PendingRewards({ account, rewards }: PendingRewardsProps) {
  return (
    <li>
      {account.name ?? account.address}:{" "}
      {use(useNativeTokenAmountFromPlanck(rewards)).toLocaleString()}
    </li>
  );
}
