# @reactive-dot/core

## 0.22.0

### Minor Changes

- [#279](https://github.com/tien/reactive-dot/pull/279) [`02b5633`](https://github.com/tien/reactive-dot/commit/02b56338948e32463b9b3e682340a25920386d91) Thanks [@tien](https://github.com/tien)! - Added target chains option to define default chains for providing type definitions.

## 0.21.0

### Minor Changes

- [#273](https://github.com/tien/reactive-dot/pull/273) [`2c30634`](https://github.com/tien/reactive-dot/commit/2c3063493977b78c95312b507332cced8296e66b) Thanks [@tien](https://github.com/tien)! - Added a helper function to easily define config.

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

## 0.19.0

### Minor Changes

- [#245](https://github.com/tien/reactive-dot/pull/245) [`98bb09e`](https://github.com/tien/reactive-dot/commit/98bb09e623805cf772dd42ce1ed144f569a71bae) Thanks [@tien](https://github.com/tien)! - Added Vue integration.

### Patch Changes

- Updated dependencies [[`98bb09e`](https://github.com/tien/reactive-dot/commit/98bb09e623805cf772dd42ce1ed144f569a71bae)]:
  - @reactive-dot/utils@0.9.0

## 0.18.0

### Minor Changes

- [#260](https://github.com/tien/reactive-dot/pull/260) [`42d6d34`](https://github.com/tien/reactive-dot/commit/42d6d343bb299d56b14a18dd0d7e54c90d20c1b6) Thanks [@tien](https://github.com/tien)! - Added support for specifying DApp name used by injected wallets.

## 0.16.5

### Patch Changes

- Updated dependencies [[`cfcf0e6`](https://github.com/tien/reactive-dot/commit/cfcf0e6a60862565987b9763ca6f96c1b159c839)]:
  - @reactive-dot/utils@0.8.1

## 0.16.0

### Minor Changes

- [#168](https://github.com/tien/reactive-dot/pull/168) [`1c4fdee`](https://github.com/tien/reactive-dot/commit/1c4fdee520b066254c48ba58562c50d75473da69) Thanks [@tien](https://github.com/tien)! - Added Ledger wallet integration.

## 0.15.0

### Minor Changes

- [#199](https://github.com/tien/reactive-dot/pull/199) [`6370689`](https://github.com/tien/reactive-dot/commit/63706898748890dc4f16a2469deafbd36dedf9b5) Thanks [@tien](https://github.com/tien)! - Added support for formatting addresses based on their chain's SS58 format.

## 0.14.0

### Minor Changes

- [#186](https://github.com/tien/reactive-dot/pull/186) [`a215f26`](https://github.com/tien/reactive-dot/commit/a215f26b3d22feea611ede32ebdbaace4adf7503) Thanks [@tien](https://github.com/tien)! - BREAKING: Updated all variables and types to use the library’s full name.

## 0.13.0

### Minor Changes

- [#174](https://github.com/tien/reactive-dot/pull/174) [`1468d69`](https://github.com/tien/reactive-dot/commit/1468d69091e4aa96886edbf3272b0b3df21a4a4a) Thanks [@tien](https://github.com/tien)! - BREAKING: switched to camelCase for exported symbols.

- [#172](https://github.com/tien/reactive-dot/pull/172) [`46abe19`](https://github.com/tien/reactive-dot/commit/46abe19dd85a54385e480941baae2275603718e9) Thanks [@tien](https://github.com/tien)! - BREAKING: moved internal types to subpath export.

## 0.12.0

### Minor Changes

- [#149](https://github.com/tien/reactive-dot/pull/149) [`21ec7d1`](https://github.com/tien/reactive-dot/commit/21ec7d14185ac02c4f48e365db2932eae324aec8) Thanks [@tien](https://github.com/tien)! - BREAKING: Moved WalletConnect adapter to a standalone package.

## 0.10.0

### Patch Changes

- [#143](https://github.com/tien/reactive-dot/pull/143) [`a845ca5`](https://github.com/tien/reactive-dot/commit/a845ca5646e62f205db0949474376916e93093e9) Thanks [@tien](https://github.com/tien)! - Fixed permanent suspense when no wallets are available.

## 0.9.0

### Patch Changes

- [#129](https://github.com/tien/reactive-dot/pull/129) [`255c1c8`](https://github.com/tien/reactive-dot/commit/255c1c8d3dd7ce39977dbd02535234b38033aa77) Thanks [@tien](https://github.com/tien)! - Fixed incorrect atom type when querying with block hash.

## 0.8.0

### Minor Changes

- [#116](https://github.com/tien/reactive-dot/pull/116) [`c2c3a61`](https://github.com/tien/reactive-dot/commit/c2c3a617d54cc1db9ed4bfec276d46044e8100db) Thanks [@tien](https://github.com/tien)! - Added a function to retrieve the best or finalized block and introduced an experimental feature for extracting extrinsics from a block.

- [#105](https://github.com/tien/reactive-dot/pull/105) [`336b208`](https://github.com/tien/reactive-dot/commit/336b208627776e85f9173bcc36e1a86e6d389299) Thanks [@tien](https://github.com/tien)! - Add source and declaration maps for improved debugging and type checking.

- [#120](https://github.com/tien/reactive-dot/pull/120) [`6ba27d5`](https://github.com/tien/reactive-dot/commit/6ba27d5641ca82d1f65fba7c4a9b4938627f0911) Thanks [@dependabot](https://github.com/apps/dependabot)! - Increased required PAPI version to `^1.0.0`.

### Patch Changes

- Updated dependencies [[`336b208`](https://github.com/tien/reactive-dot/commit/336b208627776e85f9173bcc36e1a86e6d389299)]:
  - @reactive-dot/utils@0.8.0

## 0.7.0

### Patch Changes

- Updated dependencies [[`ec6ef50`](https://github.com/tien/reactive-dot/commit/ec6ef50184fbb854026c16b1455dd09da4178272)]:
  - @reactive-dot/utils@0.7.0

## 0.5.0

### Minor Changes

- [#74](https://github.com/tien/reactive-dot/pull/74) [`294d7f0`](https://github.com/tien/reactive-dot/commit/294d7f07b4e622eac94c55c43c400d8eae34ad01) Thanks [@tien](https://github.com/tien)! - **BREAKING**: move `WalletConnect` logic to dedicated subpath export.

## 0.4.0

### Patch Changes

- [#56](https://github.com/tien/reactive-dot/pull/56) [`18cb167`](https://github.com/tien/reactive-dot/commit/18cb167af54c57aa3d6af999e621618d10bbaac5) Thanks [@tien](https://github.com/tien)! - Fix query crashing when specifying the `at` option.

- Updated dependencies []:
  - @reactive-dot/utils@0.4.0

## 0.3.1

### Patch Changes

- [#43](https://github.com/tien/reactive-dot/pull/43) [`be24bc6`](https://github.com/tien/reactive-dot/commit/be24bc60c87fc4e35c68aa9412cdb225d4c9b895) Thanks [@tien](https://github.com/tien)! - Fix incorrect return type from `useAccounts` hook.

- Updated dependencies []:
  - @reactive-dot/utils@0.3.1

## 0.3.0

### Minor Changes

- [#22](https://github.com/tien/reactive-dot/pull/22) [`eea304b`](https://github.com/tien/reactive-dot/commit/eea304b1fd1ddaa31691f01cbc4e03d998bb4fdf) Thanks [@tien](https://github.com/tien)! - Add source wallet to account.

### Patch Changes

- [#36](https://github.com/tien/reactive-dot/pull/36) [`dfa501f`](https://github.com/tien/reactive-dot/commit/dfa501f0d6e26fc010f50ca5b67ec8f0675f9c9a) Thanks [@tien](https://github.com/tien)! - Use `^` (compatible) version range.

- Updated dependencies [[`dfa501f`](https://github.com/tien/reactive-dot/commit/dfa501f0d6e26fc010f50ca5b67ec8f0675f9c9a)]:
  - @reactive-dot/utils@0.3.0

## 0.2.0

### Minor Changes

- [#14](https://github.com/tien/reactive-dot/pull/14) [`11b17b0`](https://github.com/tien/reactive-dot/commit/11b17b0b7819f44ebca5c08ba2e11d36dde5f8f7) Thanks [@tien](https://github.com/tien)! - Support for Polkadot-API version 0.11.2

### Patch Changes

- Updated dependencies []:
  - @reactive-dot/utils@0.2.0

## 0.1.1

### Patch Changes

- [#11](https://github.com/tien/reactive-dot/pull/11) [`7446493`](https://github.com/tien/reactive-dot/commit/7446493ddae1e4bc9a216736c0fd5273530f2bce) Thanks [@tien](https://github.com/tien)! - Fix changeset publish does not resolves Yarn workspace dependencies

- Updated dependencies [[`7446493`](https://github.com/tien/reactive-dot/commit/7446493ddae1e4bc9a216736c0fd5273530f2bce)]:
  - @reactive-dot/utils@0.1.1

## 0.1.0

### Minor Changes

- [`490a6e1`](https://github.com/tien/reactive-dot/commit/490a6e16be5031ddca2d9eecb184aa14f1cbd508) Thanks [@tien](https://github.com/tien)! - Initial release

### Patch Changes

- Updated dependencies [[`490a6e1`](https://github.com/tien/reactive-dot/commit/490a6e16be5031ddca2d9eecb184aa14f1cbd508)]:
  - @reactive-dot/utils@0.1.0
