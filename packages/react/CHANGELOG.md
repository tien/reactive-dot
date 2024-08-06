# @reactive-dot/react

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
