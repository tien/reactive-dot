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
