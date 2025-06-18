---
sidebar_position: 4
---

# Incremental loading

## `stream`

For multi-entry queries like `storages`, `runtimeApis`, etc., the `stream` directive allows the client to receive partial results as they become available, before the entire response is ready.

Take this basic example, where a component displays the total balance across multiple staking positions:

```tsx
import { useLazyLoadQuery } from "@reactive-dot/react";

function TotalStaked() {
  const ledgers = useLazyLoadQuery((query) =>
    query.readStorages(
      "Staking",
      "Ledger",
      addresses.map((address) => [address] as const),
    ),
  );

  return (
    <p>Total staked: {ledgers.reduce((prev, curr) => prev + curr.total, 0n)}</p>
  );
}
```

This works well for a small number of accounts, where results load quickly. But with many accounts, waiting for the full response may be too slow and undesirable. To show users a partial result as soon as possible, you can enable streaming.

When you pass `{ stream: true }` to the query, each item in the result array will now be either:

- A resolved value (the response you expect), or
- A special `pending` symbol from `@reactive-dot/core`, indicating that the data for that item hasn’t arrived yet.

This allows your UI to update incrementally as each item resolves:

```tsx
import { pending } from "@reactive-dot/core";
import { useLazyLoadQuery } from "@reactive-dot/react";

function TotalStaked() {
  const ledgers = useLazyLoadQuery((query) =>
    query.readStorages(
      "Staking",
      "Ledger",
      addresses.map((address) => [address] as const),
      { stream: true },
    ),
  );

  const loadedLedgers = ledgers.filter((ledger) => ledger !== pending);

  const hasMore = ledgers.includes(pending);

  return (
    <p>
      Total staked:{" "}
      {loadedLedgers.reduce((prev, curr) => prev + curr.total, 0n)}
      {hasMore ? "..." : ""}
    </p>
  );
}
```

With `stream: true`, the component can render incrementally, updating the total as each balance loads.

:::tip
You can use the presence of `pending` to show loading indicators, spinners, or skeletons while waiting for the rest of the data.
:::
