import { type PrefixedStorage, defaultStorage } from "../storage.js";
import type { PolkadotSignerAccount } from "./account.js";
import type { Observable } from "rxjs";

export type WalletOptions = {
  storage?: PrefixedStorage | undefined;
};

export abstract class Wallet<TStorageKey extends string = string> {
  abstract readonly id: string;

  abstract readonly name: string;

  readonly #storage: PrefixedStorage;

  protected get storage() {
    return this.#storage.join<TStorageKey>(this.id);
  }

  constructor(options?: WalletOptions | undefined) {
    this.#storage = (options?.storage ?? defaultStorage).join("wallet");
  }

  abstract initialize(): void | Promise<void>;

  abstract readonly connected$: Observable<boolean>;

  abstract connect(): void | Promise<void>;

  abstract disconnect(): void | Promise<void>;

  abstract readonly accounts$: Observable<PolkadotSignerAccount[]>;

  abstract getAccounts():
    | PolkadotSignerAccount[]
    | Promise<PolkadotSignerAccount[]>;
}
