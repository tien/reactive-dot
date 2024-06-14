import type Wallet from "../wallet.js";
import type { Observable } from "rxjs";

export default abstract class Connector {
  abstract readonly scan: () => Wallet[] | Promise<Wallet[]>;

  abstract readonly wallets$: Observable<Wallet[]>;

  abstract readonly getWallets: () => Wallet[] | Promise<Wallet[]>;
}
