import { BaseError } from "../../errors.js";
import type { PolkadotSignerAccount } from "../account.js";
import { Wallet, type WalletOptions } from "../wallet.js";
import {
  connectInjectedExtension,
  type InjectedExtension,
  type InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export type InjectedWalletOptions = WalletOptions & { originName?: string };

export class InjectedWallet extends Wallet<InjectedWalletOptions, "connected"> {
  readonly #extension$ = new BehaviorSubject<InjectedExtension | undefined>(
    undefined,
  );

  get id() {
    return `injected/${this.name}`;
  }

  constructor(
    public readonly name: string,
    options?: InjectedWalletOptions,
  ) {
    super(options);
  }

  async initialize() {
    if (this.storage.getItem("connected") !== null) {
      await this.connect();
    }
  }

  readonly connected$ = this.#extension$.pipe(
    map((extension) => extension !== undefined),
  );

  async connect() {
    if (this.#extension$.getValue() === undefined) {
      this.#extension$.next(
        await connectInjectedExtension(this.name, this.options?.originName),
      );
      this.storage.setItem("connected", JSON.stringify(true));
    }
  }

  disconnect() {
    this.#extension$.getValue()?.disconnect();
    this.#extension$.next(undefined);
    this.storage.removeItem("connected");
  }

  readonly accounts$ = this.#extension$.pipe(
    switchMap((extension) => {
      if (extension === undefined) {
        return of([]);
      }

      return new Observable<PolkadotSignerAccount[]>((subscriber) => {
        subscriber.next(this.#withIds(extension.getAccounts()));
        subscriber.add(
          extension.subscribe((accounts) =>
            subscriber.next(this.#withIds(accounts)),
          ),
        );
      });
    }),
  );

  override getAccounts() {
    const extension = this.#extension$.getValue();

    if (extension === undefined) {
      throw new BaseError("Extension is not connected");
    }

    return this.#withIds(extension.getAccounts());
  }

  #withIds(accounts: InjectedPolkadotAccount[]) {
    return accounts.map((account, index) => ({
      id: index.toString(),
      ...account,
    }));
  }
}
