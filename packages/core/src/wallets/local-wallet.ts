import type { Wallet } from "./wallet.js";

export type LocalWallet = Wallet & {
  addAccount(...args: unknown[]): void | Promise<void>;
  removeAccount(...args: unknown[]): void | Promise<void>;
  clearAccounts(): void | Promise<void>;
};
