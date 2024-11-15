# @reactive-dot/vue

## 0.26.2

### Patch Changes

- Updated dependencies [[`a3da0de`](https://github.com/tien/reactive-dot/commit/a3da0de4207499ff6e766f7affd08d086803a897)]:
  - @reactive-dot/core@0.26.2

## 0.26.1

### Patch Changes

- [#337](https://github.com/tien/reactive-dot/pull/337) [`e5c37d0`](https://github.com/tien/reactive-dot/commit/e5c37d04fbdf5515c09f65875c4f8f6c6c1c5f01) Thanks [@tien](https://github.com/tien)! - Moved `initializeWallets` function to top-level exports.

- Updated dependencies [[`a638b48`](https://github.com/tien/reactive-dot/commit/a638b48e595f5dd6d87141f12f62616b507f3ed8), [`e5c37d0`](https://github.com/tien/reactive-dot/commit/e5c37d04fbdf5515c09f65875c4f8f6c6c1c5f01)]:
  - @reactive-dot/core@0.26.1

## 0.26.0

### Minor Changes

- [#334](https://github.com/tien/reactive-dot/pull/334) [`ee5d6a3`](https://github.com/tien/reactive-dot/commit/ee5d6a305cd1bfe9213ea82d5c81d0e1bcce2dfa) Thanks [@tien](https://github.com/tien)! - Added `useNativeToken` and `useSpendableBalance` composables.

### Patch Changes

- Updated dependencies [[`ee5d6a3`](https://github.com/tien/reactive-dot/commit/ee5d6a305cd1bfe9213ea82d5c81d0e1bcce2dfa)]:
  - @reactive-dot/core@0.26.0

## 0.25.1

### Patch Changes

- Updated dependencies [[`ed4e82d`](https://github.com/tien/reactive-dot/commit/ed4e82d3eed9499f0c59d3bb1fceb151ce1e305a)]:
  - @reactive-dot/core@0.25.1

## 0.24.1

### Patch Changes

- [#309](https://github.com/tien/reactive-dot/pull/309) [`f13af19`](https://github.com/tien/reactive-dot/commit/f13af19c754762ca008cf70ac250fecc7114f3e4) Thanks [@tien](https://github.com/tien)! - Fixed issue where provided value for debugging was not removed.

- [#306](https://github.com/tien/reactive-dot/pull/306) [`bbda9ef`](https://github.com/tien/reactive-dot/commit/bbda9ef093e87a96d6eb23ba51464ec02ba08bb2) Thanks [@tien](https://github.com/tien)! - Simplified wallet provider interface.

- Updated dependencies [[`bbda9ef`](https://github.com/tien/reactive-dot/commit/bbda9ef093e87a96d6eb23ba51464ec02ba08bb2), [`0958ce1`](https://github.com/tien/reactive-dot/commit/0958ce1f6c06f6e163b4ce6e8f012caf4fb34040), [`13c5dae`](https://github.com/tien/reactive-dot/commit/13c5dae1a0ca5500d798ac31e3a8b81bc9d3f78a)]:
  - @reactive-dot/core@0.24.1

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
