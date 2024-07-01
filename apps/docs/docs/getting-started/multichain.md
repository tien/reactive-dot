---
sidebar_position: 5
---

# Multichain

## Setup

Multichain setup can be done by adding extra chain configurations, after having followed this guide [here](./setup.mdx).

### Download & sync metadata

Download the latest metadata from all chains you want to connect to and generate the types.

```sh
npx papi add dot -n polkadot
npx papi add ksm -n ksmcc3
npx papi add wnd -n westend2
npx papi
```

### Add type information

```ts title="redot.d.ts"
import type { dot, ksm, wnd } from "@polkadot-api/descriptors";

declare module "@reactive-dot/core" {
  export interface Chains {
    polkadot: typeof dot;
    kusama: typeof ksm;
    westend: typeof wnd;
  }
}
```

### Configure chains

```ts title="config.ts"
import type { dot, ksm, wnd } from "@polkadot-api/descriptors";
import type { Config } from "@reactive-dot/core";

const config: Config = {
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
};

export default config;
```

## Chain selection

Chain selection can be done either at the Context or Hook level.

### Context

One active chain at a time.

```tsx
// ...
import type { ChainId } from "@reactive-dot/core";
import type { ReDotChainProvider } from "@reactive-dot/react";

const App = () => {
  const [currentChainId, setCurrentChainId] = useState<ChainId>("polkadot");

  return (
    <ReDotChainProvider chainId={currentChainId}>
      <MyDApp />
    </ReDotChainProvider>
  );
};
```

Multiple active chains at the same time.

```tsx
// ...
import type { ReDotChainProvider } from "@reactive-dot/react";

const App = () => (
  <>
    <ReDotChainProvider chainId="polkadot">
      <MyDApp />
    </ReDotChainProvider>
    <ReDotChainProvider chainId="kusama">
      <MyDApp />
    </ReDotChainProvider>
    <ReDotChainProvider chainId="westend">
      <MyDApp />
    </ReDotChainProvider>
  </>
);
```

### Hook

All hooks provide an option to specify which chain to target.

```tsx
import { useBlock } from "@reactive-dot/react";

const Component = () => {
  const polkadotBlock = useBlock({ chainId: "polkadot" });
  const kusamaBlock = useBlock({ chainId: "kusama" });
  const westendBlock = useBlock({ chainId: "westend" });
};
```
