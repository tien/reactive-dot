# @reactive-dot/react

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
