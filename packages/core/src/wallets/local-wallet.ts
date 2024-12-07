import type { MaybePromise } from "../types.js";
import type { PolkadotSignerAccount } from "./account.js";
import { Wallet, type WalletOptions } from "./wallet.js";

/**
 * @experimental
 */
export abstract class LocalWallet<
  TAccount extends Pick<PolkadotSignerAccount, "id">,
  TOptions extends WalletOptions,
  TStorageKey extends string,
> extends Wallet<TOptions, TStorageKey> {
  /**
   * @experimental
   */
  abstract accountStore: {
    add(account: TAccount): MaybePromise<void>;
    clear(): MaybePromise<void>;
    delete(account: { id: TAccount["id"] }): MaybePromise<void>;
    delete(accountId: TAccount["id"]): MaybePromise<void>;
    has(account: { id: TAccount["id"] }): MaybePromise<boolean>;
    has(accountId: TAccount["id"]): MaybePromise<boolean>;
    values(): Iterable<TAccount>;
  };
}
