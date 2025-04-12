---
sidebar_position: 2
---

# Query

The [`useLazyLoadQuery`](/api/react/function/useLazyLoadQuery) hook allow you to read any data from chain, while maintaining updates, concurrency, caching & deduplication behind the scene for you.

## Async handling

[`useLazyLoadQuery`](/api/react/function/useLazyLoadQuery) utilize React's Suspense API for data fetching & error handling.

```tsx
function ActiveEra() {
  const activeEra = useLazyLoadQuery((builder) =>
    builder.storage("Staking", "ActiveEra"),
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

Fetching multiple data can be done by chaining queries together, [`useLazyLoadQuery`](/api/react/function/useLazyLoadQuery) (with TypeScript) will automatically infer that you want to fetch multiple data concurrently & will return an array of data instead.

```tsx
function MultiQuery() {
  const [expectedBlockTime, epochDuration, proposalCount] = useLazyLoadQuery(
    (builder) =>
      builder
        .constant("Babe", "ExpectedBlockTime")
        .constant("Babe", "EpochDuration")
        .storage("Treasury", "ProposalCount"),
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

Multiple queries of the same type can also be fetched using [`runtimeApis`](/api/core/class/Query#runtimeApis) & [`storages`](/api/core/class/Query#storages).

```tsx
const [rewards, metadatum] = useLazyLoadQuery((builder) =>
  builder
    .runtimeApis("NominationPoolsApi", "pending_rewards", [
      [ADDRESS_1],
      [ADDRESS_2],
      [ADDRESS_3],
    ])
    .storages("NominationPools", "Metadata", [
      [POOL_ID_1],
      [POOL_ID_2],
      [POOL_ID_3],
    ]),
);
```

## Dependent queries

Result of a query can be used as variables in subsequent queries.

```tsx
function Query() {
  const pools = useLazyLoadQuery((builder) =>
    builder.storageEntries("NominationPools", "BondedPools"),
  );

  const poolMetadatum = useLazyLoadQuery((builder) =>
    builder.storages(
      "NominationPools",
      "Metadata",
      pools.map(([[poolId], _]) => [poolId] as const),
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

const conditionalReturn = useLazyLoadQuery((builder) =>
  account === undefined
    ? undefined
    : builder.runtimeApi("NominationPoolsApi", "pending_rewards", [
        account.address,
      ]),
);

// Or

const conditionalFunction = useLazyLoadQuery(
  account === undefined
    ? undefined
    : (builder) =>
        builder.runtimeApi("NominationPoolsApi", "pending_rewards", [
          account.address,
        ]),
);

// Result will be `idle` if the query hasn't been executed
if (conditionalReturn === idle || conditionalFunction === idle) {
  console.log("Queries are in idle state");
}
```

## Refreshing queries

Certain query, like runtime API calls doesn't create any subscriptions. In order to get the latest data, they must be manually refreshed using `options.fetchKey`.

```tsx
import { useState, useTransition } from "react";

function QueryWithRefresh() {
  const [fetchCount, setFetchCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const pendingRewards = useLazyLoadQuery(
    (builder) =>
      builder.runtimeApi("NominationPoolsApi", "pending_rewards", [
        ACCOUNT_ADDRESS,
      ]),
    { fetchKey: fetchCount },
  );

  return (
    <div>
      <p>{pendingRewards.toLocaleString()}</p>
      <button
        onClick={() =>
          startTransition(() => setFetchCount((count) => count + 1))
        }
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
  const [account1Rewards, account2Rewards] = useLazyLoadQuery((builder) =>
    builder
      .runtimeApi("NominationPoolsApi", "pending_rewards", [ACCOUNT_ADDRESS_1])
      .runtimeApi("NominationPoolsApi", "pending_rewards", [ACCOUNT_ADDRESS_2]),
  );
  const refreshAccount2Rewards = useQueryRefresher((builder) =>
    builder.runtimeApi("NominationPoolsApi", "pending_rewards", [
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
