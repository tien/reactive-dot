import { KeyedStorage } from "../storage.js";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import type { Observable } from "rxjs";

export type WalletOptions = {
  storage?: KeyedStorage | undefined;
};

export default abstract class Wallet {
  abstract readonly id: string;

  abstract readonly name: string;

  protected readonly storage: KeyedStorage;

  constructor(options: WalletOptions | undefined) {
    this.storage =
      options?.storage ??
      new KeyedStorage({
        key: "@reactive-dot",
        storage: globalThis.localStorage,
      });
  }

  abstract readonly initialize: () => void | Promise<void>;

  abstract readonly connected$: Observable<boolean>;

  abstract readonly connect: () => void | Promise<void>;

  abstract readonly disconnect: () => void | Promise<void>;

  abstract readonly accounts$: Observable<InjectedPolkadotAccount[]>;

  abstract readonly getAccounts: () =>
    | InjectedPolkadotAccount[]
    | Promise<InjectedPolkadotAccount[]>;
}
