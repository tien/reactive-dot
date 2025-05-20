import { WalletProvider } from "../provider.js";
import { InjectedWallet, type InjectedWalletOptions } from "./wallet.js";

// TODO: remove once https://github.com/polkadot-js/extension/issues/1475 is fixed
const artificialDelay = new Promise((resolve) => setTimeout(resolve, 500));

export class InjectedWalletProvider extends WalletProvider {
  constructor(private readonly options?: InjectedWalletOptions) {
    super();
  }

  async getWallets() {
    await artificialDelay;

    const { getInjectedExtensions } = await import("polkadot-api/pjs-signer");

    return getInjectedExtensions().map(
      (name) => new InjectedWallet(name, this.options),
    );
  }
}
