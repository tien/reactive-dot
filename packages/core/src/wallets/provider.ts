import type { Wallet } from "./wallet.js";
import type { Observable } from "rxjs";

export abstract class WalletProvider {
  abstract scan(): Wallet[] | Promise<Wallet[]>;

  abstract readonly wallets$: Observable<Wallet[]>;
}
