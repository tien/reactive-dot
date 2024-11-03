import type { Wallet } from "./wallet.js";

export abstract class WalletProvider {
  abstract getWallets(): Wallet[] | Promise<Wallet[]>;
}
