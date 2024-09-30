import type { PolkadotSignerAccount } from "./account.js";
import { Wallet } from "./wallet.js";

/**
 * @experimental
 */
export abstract class LocalWallet<
  TAccount extends Pick<PolkadotSignerAccount, "id">,
  TStorageKey extends string,
> extends Wallet<TStorageKey> {
  /**
   * @experimental
   */
  abstract accountStore: {
    add(account: TAccount): void | Promise<void>;
    clear(): void | Promise<void>;
    delete(account: { id: TAccount["id"] }): void | Promise<void>;
    delete(accountId: TAccount["id"]): void | Promise<void>;
    has(account: { id: TAccount["id"] }): boolean | Promise<boolean>;
    has(accountId: TAccount["id"]): boolean | Promise<boolean>;
    values(): Iterable<TAccount>;
  };
}
