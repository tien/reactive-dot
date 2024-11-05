import { Wallet, type WalletProvider } from "../wallets/index.js";

export function aggregateWallets(
  providersOrWallets: ReadonlyArray<Wallet | WalletProvider>,
) {
  return Promise.all(
    providersOrWallets.map((walletOrProvider) =>
      walletOrProvider instanceof Wallet
        ? [walletOrProvider]
        : walletOrProvider.getOrFetchWallets(),
    ),
  ).then((wallets) => wallets.flat());
}
