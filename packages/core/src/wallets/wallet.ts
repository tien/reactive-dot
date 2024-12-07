import { type Storage, defaultStorage } from "../storage.js";
import type { MaybePromise } from "../types.js";
import type { PolkadotSignerAccount } from "./account.js";
import { firstValueFrom, type Observable } from "rxjs";

export type WalletOptions = {
  storage?: Storage | undefined;
};

export abstract class Wallet<
  TOptions extends WalletOptions = WalletOptions,
  TStorageKey extends string = string,
> {
  abstract readonly id: string;

  abstract readonly name: string;

  readonly #storage: Storage;

  protected get storage() {
    return this.#storage.join<TStorageKey>(this.id);
  }

  constructor(protected readonly options?: TOptions | undefined) {
    this.#storage = (options?.storage ?? defaultStorage).join("wallet");
  }

  abstract initialize(): MaybePromise<void>;

  abstract readonly connected$: Observable<boolean>;

  abstract connect(): MaybePromise<void>;

  abstract disconnect(): MaybePromise<void>;

  abstract readonly accounts$: Observable<PolkadotSignerAccount[]>;

  getAccounts(): MaybePromise<PolkadotSignerAccount[]> {
    return firstValueFrom(this.accounts$, { defaultValue: [] });
  }
}
