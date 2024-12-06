---
sidebar_position: 2
---

# Query

The [`useQuery`](/api/react/function/useQuery) hook allow you to read any data from chain, while maintaining updates, concurrency, caching & deduplication behind the scene for you.

## Async handling

[`useQuery`](/api/react/function/useQuery) utilize React's Suspense API for data fetching & error handling.

```tsx
function ActiveEra() {
  const activeEra = use(
    useQuery((builder) => builder.readStorage("Staking", "ActiveEra", [])),
  );

  return <div>Active era: {activeEra}</div>;
}

function App() {
  return (
    <ErrorBoundary fallback="Error fetching active era!">
      <Suspense fallback="Fetching active era...">
        <ActiveEra />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Fetching multiple data

Fetching multiple data can be done by chaining queries together, [`useQuery`](/api/react/function/useQuery) (with TypeScript) will automatically infer that you want to fetch multiple data concurrently & will return an array of data instead.

```tsx
function MultiQuery() {
  const [expectedBlockTime, epochDuration, proposalCount] = use(
    useQuery((builder) =>
      builder
        .getConstant("Babe", "ExpectedBlockTime")
        .getConstant("Babe", "EpochDuration")
        .readStorage("Treasury", "ProposalCount", []),
    ),
  );

  return (
    <dl>
      <dt>Expected block time</dt>
      <dd>{expectedBlockTime}</dd>

      <dt>Epoch duration</dt>
      <dd>{epochDuration}</dd>

      <dt>Proposal count</dt>
      <dd>{proposalCount}</dd>
    </dl>
  );
}
```

Multiple queries of the same type can also be fetched using [`callApis`](/api/core/class/Query#callApis) & [`readStorages`](/api/core/class/Query#readStorages).

```tsx
const [rewards, metadatum] = use(
  useQuery((builder) =>
    builder
      .callApis("NominationPoolsApi", "pending_rewards", [
        [ADDRESS_1],
        [ADDRESS_2],
        [ADDRESS_3],
      ])
      .readStorages("NominationPools", "Metadata", [
        [POOL_ID_1],
        [POOL_ID_2],
        [POOL_ID_3],
      ]),
  ),
);
```

## Dependent queries

Result of a query can be used as variables in subsequent queries.

```tsx
function Query() {
  const pools = use(
    useQuery((builder) =>
      builder.readStorageEntries("NominationPools", "BondedPools", []),
    ),
  );

  const poolMetadatum = use(
    useQuery((builder) =>
      builder.readStorages(
        "NominationPools",
        "Metadata",
        pools.map(({ keyArgs: [poolId] }) => [poolId] as const),
      ),
    ),
  );

  return (
    <section>
      <h1>Pool names</h1>
      <ul>
        {poolMetadatum.map((metadata, index) => (
          <li key={index}>{metadata.asText()}</li>
        ))}
      </ul>
    </section>
  );
}
```

## Conditional query

Use a falsy value (`undefined`, `null` or `false`) to conditionally fetch data. If the query builder returns or itself is a falsy value, ReactiveDOT will not execute the query.

```ts
import { idle } from "@reactive-dot/core";

const conditionalReturn = use(
  useQuery((builder) =>
    account === undefined
      ? undefined
      : builder.callApi("NominationPoolsApi", "pending_rewards", [
          account.address,
        ]),
  ),
);

// Or

const conditionalFunction = use(
  useQuery(
    account === undefined
      ? undefined
      : (builder) =>
          builder.callApi("NominationPoolsApi", "pending_rewards", [
            account.address,
          ]),
  ),
);

// Result will be `idle` if the query hasn't been executed
if (conditionalReturn === idle || conditionalFunction === idle) {
  console.log("Queries are in idle state");
}
```

## Refreshing queries

Certain query, like runtime API calls & reading of storage entries doesn't create any subscriptions. In order to get the latest data, they must be manually refreshed with the [`useQueryWithRefresh`](/api/react/function/useQueryWithRefresh) hook.

```tsx
import { use, useTransition } from "react";

function QueryWithRefresh() {
  const [isPending, startTransition] = useTransition();
  const [pendingRewardsPromise, refreshPendingRewards] = useQueryWithRefresh(
    (builder) =>
      builder.callApi("NominationPoolsApi", "pending_rewards", [
        ACCOUNT_ADDRESS,
      ]),
  );

  const pendingRewards = use(pendingRewardsPromise);

  return (
    <div>
      <p>{pendingRewards.toLocaleString()}</p>
      <button
        onClick={() => startTransition(() => refreshPendingRewards())}
        disabled={isPending}
      >
        Refresh
      </button>
    </div>
  );
}
```

The above will refresh all refreshable data in the query. If you want to target specific data to refresh, a separate [`useQueryRefresher`](/api/react/function/useQueryRefresher) hook can be used.

```tsx
function QueryWithRefresh() {
  const [isPending, startTransition] = useTransition();
  const [account1Rewards, account2Rewards] = use(
    useQuery((builder) =>
      builder
        .callApi("NominationPoolsApi", "pending_rewards", [ACCOUNT_ADDRESS_1])
        .callApi("NominationPoolsApi", "pending_rewards", [ACCOUNT_ADDRESS_2]),
    ),
  );
  const refreshAccount2Rewards = useQueryRefresher((builder) =>
    builder.callApi("NominationPoolsApi", "pending_rewards", [
      ACCOUNT_ADDRESS_2,
    ]),
  );

  return (
    <div>
      {/* ... */}
      <button
        // Only the 2nd account rewards will be refreshed
        onClick={() => startTransition(() => refreshAccount2Rewards())}
        disabled={isPending}
      >
        Refresh
      </button>
    </div>
  );
}
```

## Retry failed query

Error from queries can be reset using `ErrorBoundary` & [`useQueryErrorResetter`](/api/react/function/useQueryErrorResetter) hook.

```tsx
import { useQueryErrorResetter } from "@reactive-dot/react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

function ErrorFallback(props: FallbackProps) {
  return (
    <article>
      <header>Oops, something went wrong!</header>
      <button onClick={() => props.resetErrorBoundary(props.error)}>
        Retry
      </button>
    </article>
  );
}

function AppErrorBoundary() {
  const resetQueryError = useQueryErrorResetter();

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => resetQueryError()}
    >
      {/* ... */}
    </ErrorBoundary>
  );
}
```
