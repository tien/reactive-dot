---
sidebar_position: 3
---

# Incremental loading

## `stream`

For multi-entry queries like `storages`, `runtimeApis`, etc., the `stream` directive allows the client to receive partial results as they become available, before the entire response is ready.

Take this basic example, where a component displays the total balance across multiple staking positions:

```vue
<script setup lang="ts">
import { useLazyLoadQuery } from "@reactive-dot/vue";

const { addresses } = defineProps<{
  addresses: string[];
}>();

const { data: ledgers } = await useLazyLoadQuery((query) =>
  query.storages(
    "Staking",
    "Ledger",
    addresses.map((address) => [address] as const),
  ),
);

const totalStaked = computed(() =>
  ledgers.value.reduce((prev, curr) => prev + curr.total, 0n),
);
</script>

<template>
  <p>Total staked: {{ totalStaked }}</p>
</template>
```

This works well for a small number of accounts, where results load quickly. But with many accounts, waiting for the full response may be too slow and undesirable. To show users a partial result as soon as possible, you can enable streaming.

:::info

When you pass `{ stream: true }` to the query, each item in the result array will now be either:

- A resolved value (the response you expect), or
- A special `pending` symbol from `@reactive-dot/core`, indicating that the data for that item hasn’t arrived yet.

:::

This allows your UI to update incrementally as each item resolves:

```vue
<script setup lang="ts">
import { pending } from "@reactive-dot/core";
import { useLazyLoadQuery } from "@reactive-dot/vue";

const { addresses } = defineProps<{
  addresses: string[];
}>();

const { data: ledgers } = await useLazyLoadQuery((query) =>
  query.storages(
    "Staking",
    "Ledger",
    addresses.map((address) => [address] as const),
    { stream: true },
  ),
);

const loadedLedgers = computed(() =>
  ledgers.value.filter((ledger) => ledger !== pending),
);

const totalStaked = computed(() =>
  loadedLedgers.value.reduce((prev, curr) => prev + curr.total, 0n),
);

const hasMore = computed(() => ledgers.value.includes(pending));
</script>

<template>
  <p>Total staked: {{ totalStaked }}<span v-if="hasMore">...</span></p>
</template>
```

With `stream: true`, the component can render incrementally, updating the total as each balance loads.

:::tip

You can use the presence of `pending` to show loading indicators, spinners, or skeletons while waiting for the rest of the data.

:::
