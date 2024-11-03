import { WalletProvider } from "../provider.js";
import { InjectedWallet, type InjectedWalletOptions } from "./wallet.js";
import { getInjectedExtensions } from "polkadot-api/pjs-signer";

export class InjectedWalletProvider extends WalletProvider {
  constructor(private readonly options?: InjectedWalletOptions) {
    super();
  }

  getWallets() {
    return getInjectedExtensions().map(
      (name) => new InjectedWallet(name, this.options),
    );
  }
}
