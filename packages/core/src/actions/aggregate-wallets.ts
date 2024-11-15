import { Wallet, type WalletProvider } from "../wallets/index.js";

const providerWallets = new WeakMap<
  WalletProvider,
  Promise<readonly Wallet[]>
>();

export function aggregateWallets(
  providersOrWallets: ReadonlyArray<Wallet | WalletProvider>,
) {
  return Promise.all(
    providersOrWallets.map((walletOrProvider) =>
      walletOrProvider instanceof Wallet
        ? [walletOrProvider]
        : (providerWallets.get(walletOrProvider) ??
          providerWallets
            .set(
              walletOrProvider,
              Promise.resolve(walletOrProvider.getWallets()),
            )
            .get(walletOrProvider)!),
    ),
  ).then((wallets) => wallets.flat());
}
