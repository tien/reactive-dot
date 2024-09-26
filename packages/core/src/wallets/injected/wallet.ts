import { ReactiveDotError } from "../../errors.js";
import type { PolkadotSignerAccount } from "../account.js";
import { Wallet, type WalletOptions } from "../wallet.js";
import {
  connectInjectedExtension,
  type InjectedExtension,
} from "polkadot-api/pjs-signer";
import { BehaviorSubject, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export class InjectedWallet extends Wallet {
  readonly #extension$ = new BehaviorSubject<InjectedExtension | undefined>(
    undefined,
  );

  override get id() {
    return `injected/${this.name}`;
  }

  constructor(
    public readonly name: string,
    options?: WalletOptions,
  ) {
    super(options);
  }

  override async initialize() {
    if (this.storage.getItem("connected") !== null) {
      await this.connect();
    }
  }

  override connected$ = this.#extension$.pipe(
    map((extension) => extension !== undefined),
  );

  override async connect() {
    if (this.#extension$.getValue() === undefined) {
      this.#extension$.next(await connectInjectedExtension(this.name));
      this.storage.setItem("connected", JSON.stringify(true));
    }
  }

  override disconnect() {
    this.#extension$.getValue()?.disconnect();
    this.#extension$.next(undefined);
    this.storage.removeItem("connected");
  }

  override readonly accounts$ = this.#extension$.pipe(
    switchMap(
      (extension) =>
        new Observable<PolkadotSignerAccount[]>((subscriber) => {
          if (extension === undefined) {
            subscriber.next([]);
          } else {
            subscriber.next(extension.getAccounts());
            subscriber.add(
              extension.subscribe((accounts) => subscriber.next(accounts)),
            );
          }
        }),
    ),
  );

  override getAccounts() {
    const extension = this.#extension$.getValue();

    if (extension === undefined) {
      throw new ReactiveDotError("Extension is not connected");
    }

    return extension.getAccounts();
  }
}
