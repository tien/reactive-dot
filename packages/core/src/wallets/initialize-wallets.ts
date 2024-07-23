import { WalletAggregator } from "./aggregator/index.js";
import type { Wallet } from "./wallet.js";

export async function initializeWallets(
  walletsOrAggregators: Array<Wallet | WalletAggregator>,
) {
  const wallets = (
    await Promise.all(
      walletsOrAggregators.map((walletOrAggregator) =>
        walletOrAggregator instanceof WalletAggregator
          ? walletOrAggregator.scan()
          : [walletOrAggregator],
      ),
    )
  ).flat();

  return Promise.all(wallets.map((wallet) => wallet.initialize()));
}
