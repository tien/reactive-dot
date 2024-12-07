import type { MaybePromise } from "../types.js";
import type { Wallet } from "./wallet.js";

export abstract class WalletProvider {
  abstract getWallets(): MaybePromise<Wallet[]>;
}
