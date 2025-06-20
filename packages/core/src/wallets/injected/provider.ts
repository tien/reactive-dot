import { WalletProvider } from "../provider.js";
import { InjectedWallet, type InjectedWalletOptions } from "./wallet.js";

export class InjectedWalletProvider extends WalletProvider {
  constructor(private readonly options?: InjectedWalletOptions) {
    super();
  }

  async getWallets() {
    const { getInjectedExtensions } = await import("polkadot-api/pjs-signer");

    if (globalThis.document.readyState !== "complete") {
      await new Promise<void>((resolve) =>
        globalThis.addEventListener("load", () => resolve()),
      );
    }

    return getInjectedExtensions().map(
      (name) => new InjectedWallet(name, this.options),
    );
  }
}
