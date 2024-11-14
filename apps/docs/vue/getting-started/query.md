---
sidebar_position: 2
---

# Query

The [`useQuery`](/api/vue/function/useQuery) composable allow you to read any data from chain, while maintaining updates, concurrency, caching & deduplication behind the scene for you.

## Async handling

[`useQuery`](/api/vue/function/useQuery) utilize Vue's Suspense API for data fetching & error handling.

```vue title="async-component.vue"
<script setup lang="ts">
const { data: activeEra } = await useQuery((builder) =>
  builder.readStorage("Staking", "ActiveEra", []),
);
</script>

<template>
  <div>Active era: {{ activeEra.toLocaleString() }}</div>
</template>
```

```vue title="app.vue"
<script setup lang="ts">
import AsyncComponent from "./async-component.vue";
import { onErrorCaptured } from "vue";

onErrorCaptured((error) => console.log(error));
</script>

<template>
  <Suspense>
    <AsyncComponent />
    <template #fallback>Loading...</template>
  </Suspense>
</template>
```

## Fetching multiple data

Fetching multiple data can be done by chaining queries together, [`useQuery`](/api/vue/function/useQuery) (with TypeScript) will automatically infer that you want to fetch multiple data concurrently & will return an array of data instead.

```vue
<script setup lang="ts">
import { useQuery } from "@reactive-dot/vue";
import { computed } from "vue";

const { data } = await useQuery((builder) =>
  builder
    .getConstant("Babe", "ExpectedBlockTime")
    .getConstant("Babe", "EpochDuration")
    .readStorage("Treasury", "ProposalCount", []),
);

const expectedBlockTime = computed(() => data.value[0]);
const epochDuration = computed(() => data.value[1]);
const proposalCount = computed(() => data.value[2]);
</script>
```

Multiple queries of the same type can also be fetched using [`callApis`](/api/core/class/Query#callApis) & [`readStorages`](/api/core/class/Query#readStorages).

```vue
<script setup lang="ts">
import { useQuery } from "@reactive-dot/vue";

const { data } = await useQuery((builder) =>
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
</script>
```

## Conditional query

Use a falsy value (`undefined`, `null` or `false`) to conditionally fetch data. If the query builder returns a falsy value, ReactiveDOT will not execute the query.

```vue
<script setup lang="ts">
import { useQuery } from "@reactive-dot/vue";

const { status } = await useQuery((builder) =>
  address.value === undefined
    ? undefined
    : builder.callApi("NominationPoolsApi", "pending_rewards", [address.value]),
);

// Status will be "idle" if the query hasn't been executed
if (status === "idle") {
  console.log("The query is in idle state");
}
</script>
```

## Refreshing queries

Certain query, like runtime API calls & reading of storage entries doesn't create any subscriptions. In order to get the latest data, they must be manually refreshed.

```vue
<script setup lang="ts">
import { useQuery } from "@reactive-dot/vue";

const {
  data: pendingRewards,
  refresh,
  status,
} = await useQuery((builder) =>
  builder.callApi("NominationPoolsApi", "pending_rewards", [ACCOUNT_ADDRESS]),
);
</script>

<template>
  <div>
    <p>{{ pendingRewards.toLocaleString() }}</p>
    <button @click="refresh()" :disabled="status === 'pending'">Refresh</button>
  </div>
</template>
```

## Retry failed query

Error from queries can be reset using `ErrorBoundary` & [`useQueryErrorResetter`](/api/vue/function/useQueryErrorResetter) composable.

```vue
<script setup lang="ts">
import { useQueryErrorResetter } from "@reactive-dot/vue";
import { onErrorCaptured, ref } from "vue";

const hasError = ref(false);

const { execute: resetError } = useQueryErrorResetter();

onErrorCaptured(() => (hasError.value = true));
</script>

<template>
  <article v-if="hasError">
    <header>
      <strong>Oops, something went wrong!</strong>
    </header>
    <button
      @click="
        resetError();
        hasError = false;
      "
    >
      Retry
    </button>
  </article>
  <Suspense v-else>
    <MyDApp />
    <template #fallback>Loading...</template>
  </Suspense>
</template>
```
