import { type PrefixedStorage, defaultStorage } from "../storage.js";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import type { Observable } from "rxjs";

export type WalletOptions = {
  storage?: PrefixedStorage | undefined;
};

export default abstract class Wallet {
  abstract readonly id: string;

  abstract readonly name: string;

  readonly #storage: PrefixedStorage;

  protected get storage() {
    return this.#storage.join<"connected">(this.id);
  }

  constructor(options: WalletOptions | undefined) {
    this.#storage = (options?.storage ?? defaultStorage).join("wallet");
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
