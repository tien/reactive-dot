---
sidebar_position: 3
---

# Using Polkadot-API (PAPI)

ReactiveDOT is designed as a convenient layer over [PAPI](https://papi.how/) for enhanced developer quality of life. For more advanced use cases and data manipulation, it's recommended to use [PAPI](https://papi.how/) directly. You can access PAPI APIs through two composables: [`useClient`](/api/vue/function/useClient) and [`useTypedApi`](/api/vue/function/useTypedApi).

## Polkadot client

`PolkadotClient` interface shapes the top-level API for `polkadot-api`. You can find the full documentation [here](https://papi.how/client).

```vue
<script setup lang="ts">
import { useClient } from "@reactive-dot/vue";
import { watchEffect } from "vue";

const { data: client } = await useClient();

watchEffect(() => {
  client.value._request<string>("system_version", []).then(console.log);
});
</script>
```

## Typed API

The `TypedApi` allows easy interaction with the runtime metadata, with a great developer experience. You can find the full documentation [here](https://papi.how/typed).

```vue
<script setup lang="ts">
import { useClient } from "@reactive-dot/vue";
import { useTypedApi } from "vue";

const { data: typedApi } = await useTypedApi();

watchEffect(() => {
  typedApi.value.event.Balances.Burned.watch(
    ({ amount }) => amount > 10n ** 10n,
  )
    .pipe(take(5))
    .forEach(console.log);
});
</script>
```
