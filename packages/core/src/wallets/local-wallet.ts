import { Wallet } from "./wallet.js";

/**
 * @experimental
 */
export abstract class LocalWallet<
  TAccount,
  TStorageKey extends string,
> extends Wallet<TStorageKey> {
  /**
   * @experimental
   */
  abstract addAccount(account: TAccount): void | Promise<void>;

  /**
   * @experimental
   */
  abstract removeAccount(account: TAccount): void | Promise<void>;

  /**
   * @experimental
   */
  abstract clearAccounts(): void | Promise<void>;
}
