---
sidebar_position: 2
---

# Query

The [`useQuery`](/api/react/function/useQuery) hook allow you to read any data from chain, while maintaining updates, concurrency, caching & deduplication behind the scene for you.

## Async handling

[`useQuery`](/api/react/function/useQuery) utilize React's Suspense API for data fetching & error handling.

```tsx
const ActiveEra = () => {
  const activeEra = useQuery((builder) =>
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

Fetching multiple data can be done by chaining queries together, [`useQuery`](/api/react/function/useQuery) (with TypeScript) will automatically infer that you want to fetch multiple data concurrently & will return an array of data instead.

```tsx
const MultiQuery = () => {
  const [expectedBlockTime, epochDuration, proposalCount] = useQuery(
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
      <dd>{proposal count}</dd>
    </dl>
  );
};
```

## Dependent queries

Result of a query can be used as variables in subsequent queries.

```tsx
const Query = () => {
  const pools = useQuery((builder) =>
    builder.readStorageEntries("NominationPools", "BondedPools", []),
  );

  const poolMetadatum = useQuery((builder) =>
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

## Refreshing queries

Certain query, like runtime API calls & reading of storage entries doesn't create any subscriptions. In order to get the latest data, they must be manually refreshed with the [`useQueryWithRefresh`](/api/react/function/useQueryWithRefresh) hook.

```tsx
import { useTransition } from "react";

const QueryWithRefresh = () => {
  const [isPending, startTransition] = useTransition();
  const [pendingRewards, refreshPendingRewards] = useQueryWithRefresh(
    (builder) => builder.callApi("NominationPoolsApi", "pending_rewards", []),
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
