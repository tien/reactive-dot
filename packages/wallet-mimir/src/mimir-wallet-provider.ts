import { MimirWallet, type MimirWalletOptions } from "./mimir-wallet.js";
import { isMimirReady } from "@mimirdev/apps-inject";
import { WalletProvider } from "@reactive-dot/core/wallets.js";

export class MimirWalletProvider extends WalletProvider {
  constructor(private readonly options?: MimirWalletOptions) {
    super();
  }

  async getWallets() {
    const origin = await isMimirReady();

    if (origin === null) {
      return [];
    }

    return [new MimirWallet(this.options)];
  }
}
