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
import type { Config } from "@reactive-dot/core";

export const config = {
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
} as const satisfies Config;
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
  const polkadotBlock = useBlock({ chainId: "polkadot" });
  const kusamaBlock = useBlock({ chainId: "kusama" });
  const westendBlock = useBlock({ chainId: "westend" });
}
```

## Chain narrowing

By default, ReactiveDOT provides type definitions based on the merged definitions of all chains in the config. For example, if your DApp is set up to be used with Polkadot, Kusama, and Westend, the following code will not work because the Bounties pallet only exists on Polkadot and Kusama, not on Westend:

```tsx
function Component() {
  // Since `Bounties` pallet doesn't exist on Westend, this will:
  // 1. Raise a TypeScript error
  // 2. Throw an error during runtime if Westend is selected
  const bountyCount = useLazyLoadQuery((builder) =>
    builder.readStorage("Bounties", "BountyCount", []),
  );

  // ...
}
```

You have the option of either explicitly specifying the chain to query, which will override the chain ID provided via context:

```tsx
function Component() {
  const bountyCount = useLazyLoadQuery(
    (builder) => builder.readStorage("Bounties", "BountyCount", []),
    { chainId: "polkadot" },
  );

  // ...
}
```

Or, to continue using the chain ID provided via context, you can use the [`useChainId`](/api/react/function/useChainId) hook along with its allowlist/denylist functionality:

```tsx
function BountiesPalletRequiredComponent() {
  const bountyCount = useLazyLoadQuery(
    (builder) => builder.readStorage("Bounties", "BountyCount", []),
    {
      // `useChainId` with the allow/deny list will:
      // 1. Throw an error if the context's chain ID conflicts with the list(s)
      // 2. Restrict descriptors used by `useLazyLoadQuery` to provide correct intellisense
      chainId: useChainId({
        allowlist: ["polkadot", "kusama"],
        // Or
        denylist: ["westend"],
      }),
    },
  );

  // ...
}

function App() {
  // ...

  // Only use compatible chain IDs, else an error will be thrown
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
