import type { Wallet as IWallet } from "../types/index.js";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import type { Observable } from "rxjs";

export default abstract class Wallet implements IWallet {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly connected$: Observable<boolean>;
  abstract readonly connect: () => void | Promise<void>;
  abstract readonly disconnect: () => void | Promise<void>;
  abstract readonly accounts$: Observable<InjectedPolkadotAccount[]>;
  abstract readonly getAccounts: () =>
    | InjectedPolkadotAccount[]
    | Promise<InjectedPolkadotAccount[]>;
}
