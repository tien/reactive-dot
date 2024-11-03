import type { Wallet } from "./wallet.js";

export function initializeWallets(wallets: readonly Wallet[]) {
  return Promise.all(wallets.map((wallet) => wallet.initialize()));
}
