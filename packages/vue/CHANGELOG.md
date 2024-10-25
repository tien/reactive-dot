# @reactive-dot/vue

## 0.24.0

### Minor Changes

- [#293](https://github.com/tien/reactive-dot/pull/293) [`2bdab49`](https://github.com/tien/reactive-dot/commit/2bdab4925c736a81245936fb4034984dd4211f23) Thanks [@tien](https://github.com/tien)! - BREAKING: renamed "aggregator" to "provider".

### Patch Changes

- Updated dependencies [[`2bdab49`](https://github.com/tien/reactive-dot/commit/2bdab4925c736a81245936fb4034984dd4211f23)]:
  - @reactive-dot/core@0.24.0

## 0.23.0

### Minor Changes

- [#284](https://github.com/tien/reactive-dot/pull/284) [`9b831f9`](https://github.com/tien/reactive-dot/commit/9b831f9982d359ba8be0de845b6ede1f9d170ab1) Thanks [@tien](https://github.com/tien)! - BREAKING: Removed `allowlist` and `denylist` functionality. This feature was too specific, and it’s now recommended for users to implement it as a recipe in their own applications if needed.

### Patch Changes

- [#280](https://github.com/tien/reactive-dot/pull/280) [`452b79a`](https://github.com/tien/reactive-dot/commit/452b79aa3ff447b998a2aa40b6e0c62b38089a96) Thanks [@tien](https://github.com/tien)! - Refactored generic type parameters for chain IDs & descriptors.

- Updated dependencies [[`fccd977`](https://github.com/tien/reactive-dot/commit/fccd9778365d71a6903560513455f033fded0b4c)]:
  - @reactive-dot/core@0.23.0

## 0.22.0

### Minor Changes

- [#279](https://github.com/tien/reactive-dot/pull/279) [`02b5633`](https://github.com/tien/reactive-dot/commit/02b56338948e32463b9b3e682340a25920386d91) Thanks [@tien](https://github.com/tien)! - Added target chains option to define default chains for providing type definitions.

### Patch Changes

- [#277](https://github.com/tien/reactive-dot/pull/277) [`127620f`](https://github.com/tien/reactive-dot/commit/127620fef93031a9dbfc4d40c08a0b785ea1dda5) Thanks [@tien](https://github.com/tien)! - Fixed a bug that caused an error when retrieving accounts without specifying a chain ID.

- Updated dependencies [[`02b5633`](https://github.com/tien/reactive-dot/commit/02b56338948e32463b9b3e682340a25920386d91)]:
  - @reactive-dot/core@0.22.0

## 0.21.0

### Patch Changes

- Updated dependencies [[`2c30634`](https://github.com/tien/reactive-dot/commit/2c3063493977b78c95312b507332cced8296e66b)]:
  - @reactive-dot/core@0.21.0

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
