# @reactive-dot/vue

## 0.20.0

### Minor Changes

- [#270](https://github.com/tien/reactive-dot/pull/270) [`08e5517`](https://github.com/tien/reactive-dot/commit/08e5517f01bb24285ef4684f6de27753e3a9f2e9) Thanks [@tien](https://github.com/tien)! - BREAKING: simplified chain type registration.

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

### Patch Changes

- Updated dependencies [[`08e5517`](https://github.com/tien/reactive-dot/commit/08e5517f01bb24285ef4684f6de27753e3a9f2e9)]:
  - @reactive-dot/core@0.20.0

## 0.19.0

### Minor Changes

- [#245](https://github.com/tien/reactive-dot/pull/245) [`98bb09e`](https://github.com/tien/reactive-dot/commit/98bb09e623805cf772dd42ce1ed144f569a71bae) Thanks [@tien](https://github.com/tien)! - Added Vue integration.

### Patch Changes

- Updated dependencies [[`98bb09e`](https://github.com/tien/reactive-dot/commit/98bb09e623805cf772dd42ce1ed144f569a71bae)]:
  - @reactive-dot/core@0.19.0
