import type { Wallet } from "../wallets/wallet.js";

const initializedWallets = new Set<Wallet>();

export function initializeWallets(wallets: readonly Wallet[]) {
  return Promise.all(
    wallets.map(async (wallet) => {
      if (!initializedWallets.has(wallet)) {
        await wallet.initialize();
        initializedWallets.add(wallet);
      }
    }),
  );
}
