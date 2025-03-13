# @reactive-dot/core

## 0.38.1

### Patch Changes

- [#564](https://github.com/tien/reactive-dot/pull/564) [`35c0f4d`](https://github.com/tien/reactive-dot/commit/35c0f4daf554ab4845aaca88beaf3364e49d7936) Thanks [@tien](https://github.com/tien)! - Fixed optional storage entries arguments.

## 0.38.0

### Minor Changes

- [#562](https://github.com/tien/reactive-dot/pull/562) [`c741a7d`](https://github.com/tien/reactive-dot/commit/c741a7db3390984157c84e6bc6e127cdacddd9fa) Thanks [@tien](https://github.com/tien)! - Made the arguments array optional for queries with zero arguments.

## 0.37.0

### Minor Changes

- [#556](https://github.com/tien/reactive-dot/pull/556) [`d753bba`](https://github.com/tien/reactive-dot/commit/d753bbaf96a44965a93eccd6eb90fb0add416b70) Thanks [@tien](https://github.com/tien)! - Renamed query builder methods.

## 0.36.3

### Patch Changes

- [#547](https://github.com/tien/reactive-dot/pull/547) [`3958fe9`](https://github.com/tien/reactive-dot/commit/3958fe9ab2e8281632685eb72227c4052cc93a30) Thanks [@tien](https://github.com/tien)! - Fixed incorrect native token info when dealing with non-common chain's spec (array for `tokenSymbol` & `tokenDecimals`).

## 0.36.0

### Minor Changes

- [#538](https://github.com/tien/reactive-dot/pull/538) [`9304e56`](https://github.com/tien/reactive-dot/commit/9304e5624f4e3ba5d72a15258cad262ab315cf5f) Thanks [@tien](https://github.com/tien)! - Added option to enable Substrate Connect support.

### Patch Changes

- [#534](https://github.com/tien/reactive-dot/pull/534) [`2071712`](https://github.com/tien/reactive-dot/commit/207171252d45ce686d747b1709d76831e5a06198) Thanks [@tien](https://github.com/tien)! - Ensured each wallet is initialized only once.

## 0.34.0

### Patch Changes

- [#509](https://github.com/tien/reactive-dot/pull/509) [`dfd214b`](https://github.com/tien/reactive-dot/commit/dfd214b405355994fb37afb9a7d223fdaf21295f) Thanks [@tien](https://github.com/tien)! - Made `instructions` parameter optional in `Query` constructor.

- [#516](https://github.com/tien/reactive-dot/pull/516) [`91d8a77`](https://github.com/tien/reactive-dot/commit/91d8a771d557c25f18a1bd972eb16300e3705b3d) Thanks [@tien](https://github.com/tien)! - Added descriptive names to Symbols for better clarity.

## 0.33.0

### Minor Changes

- [#506](https://github.com/tien/reactive-dot/pull/506) [`b6c5cc7`](https://github.com/tien/reactive-dot/commit/b6c5cc7a9d4ba82b2d8c890cfcc569fe6703951f) Thanks [@tien](https://github.com/tien)! - Added `Query.concat` method for merging queries.

## 0.32.0

### Patch Changes

- Updated dependencies [[`7b6c493`](https://github.com/tien/reactive-dot/commit/7b6c493fabb3e81df0dccc3025ad7dd64ba4a9cc)]:
  - @reactive-dot/utils@0.10.0

## 0.31.0

### Minor Changes

- [#479](https://github.com/tien/reactive-dot/pull/479) [`776d1ef`](https://github.com/tien/reactive-dot/commit/776d1ef29777550fdcec83b11713e53a68624d14) Thanks [@tien](https://github.com/tien)! - Added "Polkadot Coretime" to wellknown chains.

## 0.30.0

### Minor Changes

- [#453](https://github.com/tien/reactive-dot/pull/453) [`821f21b`](https://github.com/tien/reactive-dot/commit/821f21b511b4c7ef8b0eff2e3f9eb0a3addb36ac) Thanks [@tien](https://github.com/tien)! - Added `watchEntries` support; `readStorageEntries` now creates a subscription and no longer requires manual refresh.

### Patch Changes

- [#365](https://github.com/tien/reactive-dot/pull/365) [`dcc8c24`](https://github.com/tien/reactive-dot/commit/dcc8c241c7543bebecdc73438f627d6f7fd0610e) Thanks [@tien](https://github.com/tien)! - Moved core actions to internal exports.

## 0.29.0

### Minor Changes

- [#411](https://github.com/tien/reactive-dot/pull/411) [`6e1ded0`](https://github.com/tien/reactive-dot/commit/6e1ded07876d9ee6471830038e8910c369f14a4b) Thanks [@71walceli](https://github.com/71walceli)! - Added "Paseo People" to light client well-known parachains.

## 0.27.1

### Patch Changes

- [#382](https://github.com/tien/reactive-dot/pull/382) [`aeef030`](https://github.com/tien/reactive-dot/commit/aeef0303347668d7c53de3373f581b95a723fb17) Thanks [@tien](https://github.com/tien)! - Fixed PJS wallet detection, this is a workaround for the following [issue](https://github.com/polkadot-js/extension/issues/1475).

## 0.27.0

### Minor Changes

- [#368](https://github.com/tien/reactive-dot/pull/368) [`f1d984f`](https://github.com/tien/reactive-dot/commit/f1d984f0347de0928e09ab9b99a9989586031d52) Thanks [@tien](https://github.com/tien)! - Added SubstrateConnect integration.

## 0.26.2

### Patch Changes

- [#346](https://github.com/tien/reactive-dot/pull/346) [`a3da0de`](https://github.com/tien/reactive-dot/commit/a3da0de4207499ff6e766f7affd08d086803a897) Thanks [@tien](https://github.com/tien)! - Fixed wallet aggregation bug when aggregation happens asynchronously.

## 0.26.1

### Patch Changes

- [#339](https://github.com/tien/reactive-dot/pull/339) [`a638b48`](https://github.com/tien/reactive-dot/commit/a638b48e595f5dd6d87141f12f62616b507f3ed8) Thanks [@tien](https://github.com/tien)! - Refactored wallet aggregation logic.

- [#337](https://github.com/tien/reactive-dot/pull/337) [`e5c37d0`](https://github.com/tien/reactive-dot/commit/e5c37d04fbdf5515c09f65875c4f8f6c6c1c5f01) Thanks [@tien](https://github.com/tien)! - Moved `initializeWallets` function to top-level exports.

## 0.26.0

### Minor Changes

- [#334](https://github.com/tien/reactive-dot/pull/334) [`ee5d6a3`](https://github.com/tien/reactive-dot/commit/ee5d6a305cd1bfe9213ea82d5c81d0e1bcce2dfa) Thanks [@tien](https://github.com/tien)! - Added `useNativeToken` and `useSpendableBalance` composables.

## 0.25.1

### Patch Changes

- [#318](https://github.com/tien/reactive-dot/pull/318) [`ed4e82d`](https://github.com/tien/reactive-dot/commit/ed4e82d3eed9499f0c59d3bb1fceb151ce1e305a) Thanks [@tien](https://github.com/tien)! - Ensure stable reference of wallets coming from wallet provider.

## 0.24.1

### Patch Changes

- [#306](https://github.com/tien/reactive-dot/pull/306) [`bbda9ef`](https://github.com/tien/reactive-dot/commit/bbda9ef093e87a96d6eb23ba51464ec02ba08bb2) Thanks [@tien](https://github.com/tien)! - Simplified wallet provider interface.

- [#304](https://github.com/tien/reactive-dot/pull/304) [`0958ce1`](https://github.com/tien/reactive-dot/commit/0958ce1f6c06f6e163b4ce6e8f012caf4fb34040) Thanks [@tien](https://github.com/tien)! - Added default implementation for `Wallet.getAccounts`.

- [#307](https://github.com/tien/reactive-dot/pull/307) [`13c5dae`](https://github.com/tien/reactive-dot/commit/13c5dae1a0ca5500d798ac31e3a8b81bc9d3f78a) Thanks [@tien](https://github.com/tien)! - Renamed `PrefixedStorage` to `Storage`.

## 0.24.0

### Minor Changes

- [#293](https://github.com/tien/reactive-dot/pull/293) [`2bdab49`](https://github.com/tien/reactive-dot/commit/2bdab4925c736a81245936fb4034984dd4211f23) Thanks [@tien](https://github.com/tien)! - BREAKING: renamed "aggregator" to "provider".

## 0.23.0

### Patch Changes

- [#286](https://github.com/tien/reactive-dot/pull/286) [`fccd977`](https://github.com/tien/reactive-dot/commit/fccd9778365d71a6903560513455f033fded0b4c) Thanks [@tien](https://github.com/tien)! - Fixed string key generation of binary data.

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
