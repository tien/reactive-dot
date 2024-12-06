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

Chain selection can be done either at the Context or Hook level.

### Context

One active chain at a time.

```tsx
// ...
import type { ChainId } from "@reactive-dot/core";
import type { ChainProvider } from "@reactive-dot/react";

function App() {
  const [currentChainId, setCurrentChainId] = useState<ChainId>("polkadot");

  return (
    <ChainProvider chainId={currentChainId}>
      <MyDApp />
    </ChainProvider>
  );
}
```

Multiple active chains at the same time.

```tsx
// ...
import type { ChainProvider } from "@reactive-dot/react";

function App() {
  return (
    <>
      <ChainProvider chainId="polkadot">
        <MyDApp />
      </ChainProvider>
      <ChainProvider chainId="kusama">
        <MyDApp />
      </ChainProvider>
      <ChainProvider chainId="westend">
        <MyDApp />
      </ChainProvider>
    </>
  );
}
```

### Hook

All hooks provide an option to specify which chain to target.

```tsx
import { useBlock } from "@reactive-dot/react";

function Component() {
  const polkadotBlock = use(useBlock({ chainId: "polkadot" }));
  const kusamaBlock = use(useBlock({ chainId: "kusama" }));
  const westendBlock = use(useBlock({ chainId: "westend" }));
}
```

## Chain narrowing

By default, ReactiveDOT merges type definitions from all the chains in the config. For instance, if your DApp is set up to work with Polkadot, Kusama, and Westend, the following code will fail because the Bounties pallet is available only on Polkadot and Kusama, not on Westend:

```tsx
function Component() {
  // Since the `Bounties` pallet doesn't exist on Westend, this will:
  // 1. Trigger a TypeScript error
  // 2. Cause a runtime error if Westend is selected
  const bountyCount = use(
    useQuery((builder) => builder.readStorage("Bounties", "BountyCount", [])),
  );

  // ...
}
```

To resolve this, you can explicitly specify the chain to query, which will override the chain ID provided by context:

```tsx
function Component() {
  const bountyCount = use(
    useQuery((builder) => builder.readStorage("Bounties", "BountyCount", []), {
      chainId: "polkadot",
    }),
  );

  // ...
}
```

Alternatively, if you want to keep using the chain ID provided by context, you can use the following pattern:

```tsx
function useBountiesChainId() {
  const chainId = useChainId();

  switch (chainId) {
    case "polkadot":
    case "kusama":
      return chainId;
    default:
      throw new Error("This chain does not support bounties", {
        cause: chainId,
      });
  }
}

function BountiesPalletRequiredComponent() {
  const bountyCount = useQuery(
    (builder) => builder.readStorage("Bounties", "BountyCount", []),
    {
      // This will:
      // 1. Throw an error if the chain ID does not support bounties
      // 2. Restrict the possible chain types for better intellisense
      chainId: useBountiesChainId(),
    },
  );

  // ...
}

function App() {
  // ...

  // Use only compatible chain IDs, otherwise an error will be thrown
  const bountiesEnabledChainIds = ["polkadot", "kusama"] satisfies ChainId[];

  return (
    <div>
      {bountiesEnabledChainIds.map((chainId) => (
        <ChainProvider key={chainId} chainId={chainId}>
          <BountiesPalletRequiredComponent />
        </ChainProvider>
      ))}
      {/* ... */}
    </div>
  );
}
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
  // This will restrict the default chain types used by hooks
  // to just Polkadot when no explicit `chainId` is provided
  targetChains: ["polkadot"],
  // ...
});
```
