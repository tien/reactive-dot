---
sidebar_position: 3
---

# Using Polkadot-API (PAPI)

Reactive DOT is designed as a convenient layer over [PAPI](https://papi.how/) for enhanced developer quality of life. For more advanced use cases and data manipulation, it's recommended to use [PAPI](https://papi.how/) directly. You can access PAPI APIs through two hooks: [`useClient`](/api/react/function/useClient) and [`useTypedApi`](/api/react/function/useTypedApi).

## Polkadot client

`PolkadotClient` interface shapes the top-level API for `polkadot-api`. You can find the full documentation [here](https://papi.how/client).

```ts
import { useClient } from "@reactive-dot/react";

function Component() {
  const client = useClient();

  useEffect(() => {
    client._request<string>("system_version", []).then(console.log);
  }, [client]);
}
```

## Typed API

The `TypedApi` allows easy interaction with the runtime metadata, with a great developer experience. You can find the full documentation [here](https://papi.how/typed).

```ts
import { useTypedApi } from "@reactive-dot/react";

function Component() {
  const typedApi = useTypedApi();

  useEffect(() => {
    typedApi.event.Balances.Burned.watch(({ amount }) => amount > 10n ** 10n)
      .pipe(take(5))
      .forEach(console.log);
  }, [typedApi]);
}
```
