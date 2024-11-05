import type { Wallet } from "./wallet.js";

export abstract class WalletProvider {
  #wallets: Wallet[] | undefined;

  abstract getWallets(): Wallet[] | Promise<Wallet[]>;

  /**
   * @internal
   */
  async getOrFetchWallets() {
    return (this.#wallets ??= await this.getWallets());
  }
}
