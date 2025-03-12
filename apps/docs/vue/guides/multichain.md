---
sidebar_position: 1
---

# Multichain

## Setup

Multichain setup can be done by adding extra chain configurations, after having followed this guide [here](../getting-started/setup.mdx).

### Download & sync metadata

Download the latest metadata from all chains you want to connect to and generate the types.

```sh
npx papi add dot -n polkadot
npx papi add ksm -n ksmcc3
npx papi add wnd -n westend2
npx papi
```

### Add type information

```ts title="reactive-dot.d.ts"
import type { config } from "./config.js";

declare module "@reactive-dot/core" {
  export interface Register {
    config: typeof config;
  }
}
```

### Configure chains

```ts title="config.ts"
import type { dot, ksm, wnd } from "@polkadot-api/descriptors";
import { defineConfig } from "@reactive-dot/core";

export const config = defineConfig({
  chains: {
    polkadot: {
      descriptor: dot,
      // ...
    },
    kusama: {
      descriptor: ksm,
      // ...
    },
    westend: {
      descriptor: wnd,
      // ...
    },
  },
  //...
});
```

## Chain selection

Chain selection can be done either at the Context or Composable level.

### Dependency injection

```vue
<script setup lang="ts">
import type { ChainId } from "@reactive-dot/core";
import { provideChain } from "@reactive-dot/vue";
import { ref } from "vue";

const currentChainId = ref<ChainId>("polkadot");

provideChain(currentChainId);
</script>

<template>
  <!-- It's a good idea to re-mount upon switching chain to ensure data consistency -->
  <MyDApp :key="currentChainId" />
</template>
```

### Composable

All composables provide an option to specify which chain to target.

```vue
<script setup lang="ts">
import { useBlock } from "@reactive-dot/vue";

const { data: polkadotBlock } = await useBlock({ chainId: "polkadot" });
const { data: kusamaBlock } = await useBlock({ chainId: "kusama" });
const { data: westendBlock } = await useBlock({ chainId: "westend" });
</script>
```

## Chain narrowing

By default, ReactiveDOT merges type definitions from all the chains in the config. For instance, if your DApp is set up to work with Polkadot, Kusama, and Westend, the following code will fail because the Bounties pallet is available only on Polkadot and Kusama, not on Westend:

```vue
<script setup lang="ts">
import { useQuery } from "@reactive-dot/vue";

// Since the `Bounties` pallet doesn't exist on Westend, this will:
// 1. Trigger a TypeScript error
// 2. Cause a runtime error if Westend is selected
const { data: bountyCount } = await useQuery((builder) =>
  builder.storage("Bounties", "BountyCount", []),
);

// ...
</script>
```

To resolve this, you can explicitly specify the chain to query, which will override the chain ID provided by context:

```vue
<script setup lang="ts">
import { useQuery } from "@reactive-dot/vue";

const bountyCount = useQuery(
  (builder) => builder.storage("Bounties", "BountyCount", []),
  { chainId: "polkadot" },
);

// ...
</script>
```

Alternatively, if you want to keep using the chain ID provided by context, you can use the following pattern:

```vue
<script setup lang="ts">
import { useQuery, useChainId } from "@reactive-dot/vue";
import { computed } from "vue";

function useBountiesChainId() {
  const chainId = useChainId();

  computed(() => {
    switch (chainId.value) {
      case "polkadot":
      case "kusama":
        return chainId;
      default:
        throw new Error("This chain does not support bounties", {
          cause: chainId,
        });
    }
  });
}

const { data: bountyCount } = await useQuery(
  (builder) => builder.storage("Bounties", "BountyCount", []),
  {
    // This will:
    // 1. Throw an error if the chain ID does not support bounties
    // 2. Restrict the possible chain types for better intellisense
    chainId: useBountiesChainId(),
  },
);
</script>
```

Finally, if your application primarily uses a few chains but interacts with many other supporting chains, you can use the `targetChains` option:

```ts
import { defineConfig } from "@reactive-dot/core";

const config = defineConfig({
  chains: {
    polkadot: {
      // ...
    },
    polkadot_asset_hub: {
      // ...
    },
    polkadot_people: {
      // ...
    },
    polkadot_collectives: {
      // ...
    },
    polkadot_bridge_hub: {
      // ...
    },
  },
  // This will restrict the default chain types used by composables
  // to just Polkadot when no explicit `chainId` is provided
  targetChains: ["polkadot"],
  // ...
});
```
