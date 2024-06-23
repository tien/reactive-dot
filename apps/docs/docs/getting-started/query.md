---
sidebar_position: 2
---

# Query

The [`useLazyLoadQuery`](/api/react/function/useLazyLoadQuery) hook allow you to read any data from chain, while maintaining updates, concurrency, caching & deduplication behind the scene for you.

## Async handling

[`useLazyLoadQuery`](/api/react/function/useLazyLoadQuery) utilize React's Suspense API for data fetching & error handling.

```tsx
const ActiveEra = () => {
  const activeEra = useLazyLoadQuery((builder) =>
    builder.readStorage("Staking", "ActiveEra", []),
  );

  return <div>Active era: {activeEra}</div>;
};

const App = () => {
  return (
    <ErrorBoundary fallback="Error fetching active era!">
      <Suspense fallback="Fetching active era...">
        <ActiveEra />
      </Suspense>
    </ErrorBoundary>
  );
};
```

## Fetching multiple data

Fetching multiple data can be done by chaining queries together, [`useLazyLoadQuery`](/api/react/function/useLazyLoadQuery) (with TypeScript) will automatically infer that you want to fetch multiple data concurrently & will return an array of data instead.

```tsx
const MultiQuery = () => {
  const [expectedBlockTime, epochDuration, proposalCount] = useLazyLoadQuery(
    (builder) =>
      builder
        .fetchConstant("Babe", "ExpectedBlockTime")
        .fetchConstant("Babe", "EpochDuration")
        .readStorage("Treasury", "ProposalCount", []),
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
};
```

Multiple queries of the same type can also be fetched using [`callApis`](/api/core/class/Query#callApis) & [`readStorages`](/api/core/class/Query#readStorages).

```tsx
const [rewards, metadatum] = useLazyLoadQuery((builder) =>
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
);
```

## Dependent queries

Result of a query can be used as variables in subsequent queries.

```tsx
const Query = () => {
  const pools = useLazyLoadQuery((builder) =>
    builder.readStorageEntries("NominationPools", "BondedPools", []),
  );

  const poolMetadatum = useLazyLoadQuery((builder) =>
    builder.readStorages(
      "NominationPools",
      "Metadata",
      pools.map(({ keyArgs: [poolId] }) => [poolId] as const),
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
};
```

## Conditional query

Use a falsy value (`undefined`, `null` or `false`) to conditionally fetch data. If the query builder returns or itself is a falsy value, Reactive DOT will not execute the query.

```ts
import { IDLE } from "@reactive-dot/core";

const conditionalReturn = useLazyLoadQuery((builder) =>
  account === undefined
    ? undefined
    : builder.callApi("NominationPoolsApi", "pending_rewards", [
        account.address,
      ]),
);

// Or

const conditionalFunction = useLazyLoadQuery(
  account === undefined
    ? undefined
    : (builder) =>
        builder.callApi("NominationPoolsApi", "pending_rewards", [
          account.address,
        ]),
);

// Result will be `IDLE` if the query hasn't been executed
if (conditionalReturn === IDLE || conditionalFunction === IDLE) {
  console.log("Queries are in idle state");
}
```

## Refreshing queries

Certain query, like runtime API calls & reading of storage entries doesn't create any subscriptions. In order to get the latest data, they must be manually refreshed with the [`useLazyLoadQueryWithRefresh`](/api/react/function/useLazyLoadQueryWithRefresh) hook.

```tsx
import { useTransition } from "react";

const QueryWithRefresh = () => {
  const [isPending, startTransition] = useTransition();
  const [pendingRewards, refreshPendingRewards] = useLazyLoadQueryWithRefresh(
    (builder) =>
      builder.callApi("NominationPoolsApi", "pending_rewards", [
        ACCOUNT_ADDRESS,
      ]),
  );

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
};
```

The above will refresh all refreshable data in the query. If you want to target specific data to refresh, a separate [`useQueryRefresher`](/api/react/function/useQueryRefresher) hook can be used.

```tsx
const QueryWithRefresh = () => {
  const [isPending, startTransition] = useTransition();
  const [account1Rewards, account2Rewards] = useLazyLoadQuery((builder) =>
    builder
      .callApi("NominationPoolsApi", "pending_rewards", [ACCOUNT_ADDRESS_1])
      .callApi("NominationPoolsApi", "pending_rewards", [ACCOUNT_ADDRESS_2]),
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
};
```

## Retry failed query

Error from queries can be caught and reset using `ErrorBoundary` & [`useResetQueryError`](/api/react/function/useResetQueryError) hook.

```tsx
import { useResetQueryError } from "@reactive-dot/react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

const ErrorFallback = (props: FallbackProps) => (
  <article>
    <header>Oops, something went wrong!</header>
    <button onClick={() => props.resetErrorBoundary(props.error)}>Retry</button>
  </article>
);

const AppErrorBoundary = () => {
  const resetQueryError = useResetQueryError();

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={(details) => {
        if (details.reason === "imperative-api") {
          const [error] = details.args;
          resetQueryError(error);
        }
      }}
    >
      {/* ... */}
    </ErrorBoundary>
  );
};
```
