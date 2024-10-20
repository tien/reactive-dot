---
"@reactive-dot/react": minor
"@reactive-dot/core": minor
"@reactive-dot/vue": minor
---

BREAKING: simplified chain type registration.

**Old approach:**

```ts
import type { config } from "./config.js";
import type { InferChains } from "@reactive-dot/core";

declare module "@reactive-dot/core" {
  export interface Chains extends InferChains<typeof config> {}
}
```

**New approach:**

```ts
import type { config } from "./config.js";

declare module "@reactive-dot/core" {
  export interface Register {
    config: typeof config;
  }
}
```
