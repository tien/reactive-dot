import type Wallet from "../wallet.js";
import type { Observable } from "rxjs";

export default abstract class WalletAggregator {
  abstract readonly scan: () => Wallet[] | Promise<Wallet[]>;

  abstract readonly wallets$: Observable<Wallet[]>;
}
