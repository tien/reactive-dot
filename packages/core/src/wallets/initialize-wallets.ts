import { WalletProvider } from "./provider.js";
import type { Wallet } from "./wallet.js";

export async function initializeWallets(
  walletsOrProviders: Array<Wallet | WalletProvider>,
) {
  const wallets = (
    await Promise.all(
      walletsOrProviders.map((walletOrProvider) =>
        walletOrProvider instanceof WalletProvider
          ? walletOrProvider.scan()
          : [walletOrProvider],
      ),
    )
  ).flat();

  return Promise.all(wallets.map((wallet) => wallet.initialize()));
}
