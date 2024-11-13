import { Wallet, type WalletProvider } from "../wallets/index.js";

const providerWallets = new WeakMap<WalletProvider, readonly Wallet[]>();

export function aggregateWallets(
  providersOrWallets: ReadonlyArray<Wallet | WalletProvider>,
) {
  return Promise.all(
    providersOrWallets.map((walletOrProvider) =>
      walletOrProvider instanceof Wallet
        ? [walletOrProvider]
        : (async () =>
            providerWallets.get(walletOrProvider) ??
            providerWallets
              .set(walletOrProvider, await walletOrProvider.getWallets())
              .get(walletOrProvider)!)(),
    ),
  ).then((wallets) => wallets.flat());
}
