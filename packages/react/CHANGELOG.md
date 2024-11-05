# @reactive-dot/react

## 0.25.1

### Patch Changes

- Updated dependencies [[`ed4e82d`](https://github.com/tien/reactive-dot/commit/ed4e82d3eed9499f0c59d3bb1fceb151ce1e305a)]:
  - @reactive-dot/core@0.25.1

## 0.25.0

### Minor Changes

- [#316](https://github.com/tien/reactive-dot/pull/316) [`c4094a1`](https://github.com/tien/reactive-dot/commit/c4094a14c4e871a791e5495c3434ec2f3834a40e) Thanks [@tien](https://github.com/tien)! - BREAKING: The query error resetter no longer accepts a specific error input; it now defaults to resetting all errors globally.

## 0.24.1

### Patch Changes

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

### Patch Changes

- [#264](https://github.com/tien/reactive-dot/pull/264) [`42a81e7`](https://github.com/tien/reactive-dot/commit/42a81e73fe46c5b30ada85c5af481e330bcb4878) Thanks [@tien](https://github.com/tien)! - Improved error resetting to cover all queries.

- Updated dependencies [[`98bb09e`](https://github.com/tien/reactive-dot/commit/98bb09e623805cf772dd42ce1ed144f569a71bae)]:
  - @reactive-dot/core@0.19.0

## 0.18.0

### Patch Changes

- Updated dependencies [[`42d6d34`](https://github.com/tien/reactive-dot/commit/42d6d343bb299d56b14a18dd0d7e54c90d20c1b6)]:
  - @reactive-dot/core@0.18.0

## 0.17.1

### Patch Changes

- [#258](https://github.com/tien/reactive-dot/pull/258) [`febca6e`](https://github.com/tien/reactive-dot/commit/febca6ef82c68e8f93e58be641606d767f99c926) Thanks [@tien](https://github.com/tien)! - Fixed missing pending & error events.

## 0.17.0

### Minor Changes

- [#251](https://github.com/tien/reactive-dot/pull/251) [`7f362ce`](https://github.com/tien/reactive-dot/commit/7f362ce6d87569f335c28de48a722a20d2fe9304) Thanks [@tien](https://github.com/tien)! - BREAKING: removed exports of internally used functions & interfaces.

### Patch Changes

- [#248](https://github.com/tien/reactive-dot/pull/248) [`9c9c6f3`](https://github.com/tien/reactive-dot/commit/9c9c6f382be793b4c1b121e0db8252c7729e3d26) Thanks [@tien](https://github.com/tien)! - Fixed an issue where accounts were being fetched from wallets that were not connected.

## 0.16.5

### Patch Changes

- [#234](https://github.com/tien/reactive-dot/pull/234) [`98d2370`](https://github.com/tien/reactive-dot/commit/98d23709a1888b94c77495189bba110ce5823b83) Thanks [@tien](https://github.com/tien)! - Fixed missing accepted parameter type for `useNativeTokenAmountFromPlanck`.

- Updated dependencies []:
  - @reactive-dot/core@0.16.5

## 0.16.4

### Patch Changes

- [#231](https://github.com/tien/reactive-dot/pull/231) [`306666a`](https://github.com/tien/reactive-dot/commit/306666a37f4db772903b73b933a2f5914d365dea) Thanks [@tien](https://github.com/tien)! - Fixed missing accepted parameter type for `useNativeTokenAmountFromNumber` partial application.

## 0.16.2

### Patch Changes

- [#224](https://github.com/tien/reactive-dot/pull/224) [`15beee0`](https://github.com/tien/reactive-dot/commit/15beee09dfcd6e434609a24c327aff3be244651a) Thanks [@tien](https://github.com/tien)! - Fixed TypeScript error with PAPI version 1.4.0.

## 0.16.0

### Patch Changes

- Updated dependencies [[`1c4fdee`](https://github.com/tien/reactive-dot/commit/1c4fdee520b066254c48ba58562c50d75473da69)]:
  - @reactive-dot/core@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies [[`6370689`](https://github.com/tien/reactive-dot/commit/63706898748890dc4f16a2469deafbd36dedf9b5)]:
  - @reactive-dot/core@0.15.0

## 0.14.0

### Minor Changes

- [#176](https://github.com/tien/reactive-dot/pull/176) [`5837511`](https://github.com/tien/reactive-dot/commit/583751173e1dd7546f71c421d7d4b2f98769124a) Thanks [@tien](https://github.com/tien)! - Removed `jotai-scope`, enabling consumer to use their own Jotai's store provider.

- [#186](https://github.com/tien/reactive-dot/pull/186) [`a215f26`](https://github.com/tien/reactive-dot/commit/a215f26b3d22feea611ede32ebdbaace4adf7503) Thanks [@tien](https://github.com/tien)! - BREAKING: Updated all variables and types to use the library’s full name.

### Patch Changes

- [#183](https://github.com/tien/reactive-dot/pull/183) [`c9a922d`](https://github.com/tien/reactive-dot/commit/c9a922d3ee83b78175922d89c539c0165ff9c40b) Thanks [@tien](https://github.com/tien)! - Refactored query & query-refresher logic.

- Updated dependencies [[`a215f26`](https://github.com/tien/reactive-dot/commit/a215f26b3d22feea611ede32ebdbaace4adf7503)]:
  - @reactive-dot/core@0.14.0

## 0.13.0

### Minor Changes

- [#165](https://github.com/tien/reactive-dot/pull/165) [`82aa041`](https://github.com/tien/reactive-dot/commit/82aa041997eddf56d24ba97da3ba61f38e1cda7f) Thanks [@tien](https://github.com/tien)! - BREAKING: renamed wallets "reconnect" to "initialize".

- [#174](https://github.com/tien/reactive-dot/pull/174) [`1468d69`](https://github.com/tien/reactive-dot/commit/1468d69091e4aa96886edbf3272b0b3df21a4a4a) Thanks [@tien](https://github.com/tien)! - BREAKING: switched to camelCase for exported symbols.

- [#172](https://github.com/tien/reactive-dot/pull/172) [`46abe19`](https://github.com/tien/reactive-dot/commit/46abe19dd85a54385e480941baae2275603718e9) Thanks [@tien](https://github.com/tien)! - BREAKING: moved internal types to subpath export.

### Patch Changes

- Updated dependencies [[`1468d69`](https://github.com/tien/reactive-dot/commit/1468d69091e4aa96886edbf3272b0b3df21a4a4a), [`46abe19`](https://github.com/tien/reactive-dot/commit/46abe19dd85a54385e480941baae2275603718e9)]:
  - @reactive-dot/core@0.13.0

## 0.12.0

### Patch Changes

- Updated dependencies [[`21ec7d1`](https://github.com/tien/reactive-dot/commit/21ec7d14185ac02c4f48e365db2932eae324aec8)]:
  - @reactive-dot/core@0.12.0

## 0.11.0

### Minor Changes

- [#144](https://github.com/tien/reactive-dot/pull/144) [`1297296`](https://github.com/tien/reactive-dot/commit/1297296b1514d628d5c9581f42e8b2326fc34524) Thanks [@tien](https://github.com/tien)! - Updated logic to support retrieving accounts without a defined chain ID.

## 0.10.0

### Minor Changes

- [#132](https://github.com/tien/reactive-dot/pull/132) [`510dd4b`](https://github.com/tien/reactive-dot/commit/510dd4b3930695d8936ec749cd6b0358431e29af) Thanks [@tien](https://github.com/tien)! - Added hook for getting the current signer.

### Patch Changes

- Updated dependencies [[`a845ca5`](https://github.com/tien/reactive-dot/commit/a845ca5646e62f205db0949474376916e93093e9)]:
  - @reactive-dot/core@0.10.0

## 0.9.0

### Minor Changes

- [#127](https://github.com/tien/reactive-dot/pull/127) [`7965340`](https://github.com/tien/reactive-dot/commit/7965340a58313596dfdf99d1833ad3d9bac74ee5) Thanks [@tien](https://github.com/tien)! - Added hook for pre-loading queries.

### Patch Changes

- [#124](https://github.com/tien/reactive-dot/pull/124) [`d122505`](https://github.com/tien/reactive-dot/commit/d122505fb74e9b45c7e238d3778dbf173a040c48) Thanks [@tien](https://github.com/tien)! - Fixed some global states that were unscoped.

- Updated dependencies [[`255c1c8`](https://github.com/tien/reactive-dot/commit/255c1c8d3dd7ce39977dbd02535234b38033aa77)]:
  - @reactive-dot/core@0.9.0

## 0.8.0

### Minor Changes

- [#105](https://github.com/tien/reactive-dot/pull/105) [`336b208`](https://github.com/tien/reactive-dot/commit/336b208627776e85f9173bcc36e1a86e6d389299) Thanks [@tien](https://github.com/tien)! - Add source and declaration maps for improved debugging and type checking.

### Patch Changes

- Updated dependencies [[`c2c3a61`](https://github.com/tien/reactive-dot/commit/c2c3a617d54cc1db9ed4bfec276d46044e8100db), [`336b208`](https://github.com/tien/reactive-dot/commit/336b208627776e85f9173bcc36e1a86e6d389299), [`6ba27d5`](https://github.com/tien/reactive-dot/commit/6ba27d5641ca82d1f65fba7c4a9b4938627f0911)]:
  - @reactive-dot/core@0.8.0

## 0.7.1

### Patch Changes

- [#102](https://github.com/tien/reactive-dot/pull/102) [`ff1c4f6`](https://github.com/tien/reactive-dot/commit/ff1c4f6451853a730a9ed592ec705ed0651d9bae) Thanks [@tien](https://github.com/tien)! - Add missing export for `useChainIds`.

- [#104](https://github.com/tien/reactive-dot/pull/104) [`2cf5826`](https://github.com/tien/reactive-dot/commit/2cf582624a32d50fd7e1379548d95c20fe54fad4) Thanks [@tien](https://github.com/tien)! - Use `const` modifier in case consuming applications also perform checks on library types.

## 0.7.0

### Minor Changes

- [#86](https://github.com/tien/reactive-dot/pull/86) [`ec6ef50`](https://github.com/tien/reactive-dot/commit/ec6ef50184fbb854026c16b1455dd09da4178272) Thanks [@tien](https://github.com/tien)! - Add hook for getting account's spendable balance.

- [#88](https://github.com/tien/reactive-dot/pull/88) [`5243b19`](https://github.com/tien/reactive-dot/commit/5243b1913eec85e469e9d4b0ef23e10b1024a9d7) Thanks [@tien](https://github.com/tien)! - Add hook for getting all configured chain IDs.

### Patch Changes

- Updated dependencies []:
  - @reactive-dot/core@0.7.0

## 0.6.0

### Minor Changes

- [#80](https://github.com/tien/reactive-dot/pull/80) [`b9bb4c1`](https://github.com/tien/reactive-dot/commit/b9bb4c19c33e3ce62ec6bea3eee8f517bc6e0f57) Thanks [@tien](https://github.com/tien)! - Add hooks for converting planck or number to native token amount.

- [#87](https://github.com/tien/reactive-dot/pull/87) [`94505d6`](https://github.com/tien/reactive-dot/commit/94505d6416934e9ed4c8ac7794beee1142517b0f) Thanks [@tien](https://github.com/tien)! - **BREAKING**: rename action hooks

  - `useResetQueryError` to `useQueryErrorResetter`
  - `useConnectWallet` to `useWalletConnector`
  - `useDisconnectWallet` to `useWalletDisconnector`
  - `useReconnectWallets` to `useWalletsReconnector`

## 0.5.0

### Patch Changes

- Updated dependencies [[`294d7f0`](https://github.com/tien/reactive-dot/commit/294d7f07b4e622eac94c55c43c400d8eae34ad01)]:
  - @reactive-dot/core@0.5.0

## 0.4.0

### Minor Changes

- [#47](https://github.com/tien/reactive-dot/pull/47) [`435791b`](https://github.com/tien/reactive-dot/commit/435791b0a8a715f576b9d30ffba24572a6913bc3) Thanks [@tien](https://github.com/tien)! - Add `useChainId` hook.

  - Get current chain ID from context
  - Optionally assert current chain ID using allowlist and/or denylist

### Patch Changes

- Updated dependencies [[`18cb167`](https://github.com/tien/reactive-dot/commit/18cb167af54c57aa3d6af999e621618d10bbaac5)]:
  - @reactive-dot/core@0.4.0

## 0.3.1

### Patch Changes

- [#43](https://github.com/tien/reactive-dot/pull/43) [`be24bc6`](https://github.com/tien/reactive-dot/commit/be24bc60c87fc4e35c68aa9412cdb225d4c9b895) Thanks [@tien](https://github.com/tien)! - Fix incorrect return type from `useAccounts` hook.

- Updated dependencies [[`be24bc6`](https://github.com/tien/reactive-dot/commit/be24bc60c87fc4e35c68aa9412cdb225d4c9b895)]:
  - @reactive-dot/core@0.3.1

## 0.3.0

### Patch Changes

- [#36](https://github.com/tien/reactive-dot/pull/36) [`dfa501f`](https://github.com/tien/reactive-dot/commit/dfa501f0d6e26fc010f50ca5b67ec8f0675f9c9a) Thanks [@tien](https://github.com/tien)! - Use `^` (compatible) version range.

- [#33](https://github.com/tien/reactive-dot/pull/33) [`ea12e2a`](https://github.com/tien/reactive-dot/commit/ea12e2af95cf8e45bbc602587383b1dffb4d6b42) Thanks [@tien](https://github.com/tien)! - Add React to peer dependencies.

- Updated dependencies [[`eea304b`](https://github.com/tien/reactive-dot/commit/eea304b1fd1ddaa31691f01cbc4e03d998bb4fdf), [`dfa501f`](https://github.com/tien/reactive-dot/commit/dfa501f0d6e26fc010f50ca5b67ec8f0675f9c9a)]:
  - @reactive-dot/core@0.3.0

## 0.2.0

### Patch Changes

- Updated dependencies [[`11b17b0`](https://github.com/tien/reactive-dot/commit/11b17b0b7819f44ebca5c08ba2e11d36dde5f8f7)]:
  - @reactive-dot/core@0.2.0

## 0.1.1

### Patch Changes

- [#11](https://github.com/tien/reactive-dot/pull/11) [`7446493`](https://github.com/tien/reactive-dot/commit/7446493ddae1e4bc9a216736c0fd5273530f2bce) Thanks [@tien](https://github.com/tien)! - Fix changeset publish does not resolves Yarn workspace dependencies

- Updated dependencies [[`7446493`](https://github.com/tien/reactive-dot/commit/7446493ddae1e4bc9a216736c0fd5273530f2bce)]:
  - @reactive-dot/core@0.1.1

## 0.1.0

### Minor Changes

- [`490a6e1`](https://github.com/tien/reactive-dot/commit/490a6e16be5031ddca2d9eecb184aa14f1cbd508) Thanks [@tien](https://github.com/tien)! - Initial release

### Patch Changes

- Updated dependencies [[`490a6e1`](https://github.com/tien/reactive-dot/commit/490a6e16be5031ddca2d9eecb184aa14f1cbd508)]:
  - @reactive-dot/core@0.1.0
