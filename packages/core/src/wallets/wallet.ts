import { KeyedStorage } from "../storage.js";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import type { Observable } from "rxjs";

export default abstract class Wallet {
  abstract readonly id: string;

  abstract readonly name: string;

  protected storage = new KeyedStorage({
    key: "@reactive-dot",
    storage: globalThis.localStorage,
  });

  abstract readonly initialize: () => void | Promise<void>;

  abstract readonly connected$: Observable<boolean>;

  abstract readonly connect: () => void | Promise<void>;

  abstract readonly disconnect: () => void | Promise<void>;

  abstract readonly accounts$: Observable<InjectedPolkadotAccount[]>;

  abstract readonly getAccounts: () =>
    | InjectedPolkadotAccount[]
    | Promise<InjectedPolkadotAccount[]>;
}
