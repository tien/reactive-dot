import { ReDotError } from "../errors.js";
import { KeyedStorage } from "../storage.js";
import Wallet from "./wallet.js";
import {
  connectInjectedExtension,
  type InjectedExtension,
  type InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer";
import { BehaviorSubject, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export default class InjectedWallet extends Wallet {
  readonly #extension$ = new BehaviorSubject<InjectedExtension | undefined>(
    undefined,
  );

  override get id() {
    return `injected/${this.name}`;
  }

  constructor(
    public readonly name: string,
    options?: { storage?: KeyedStorage },
  ) {
    super();

    if (options?.storage !== undefined) {
      this.storage = options?.storage;
    }
  }

  override readonly initialize = async () => {
    if (this.storage.getItem(`wallet/${this.id}/connected`) !== null) {
      await this.connect();
    }
  };

  override connected$ = this.#extension$.pipe(
    map((extension) => extension !== undefined),
  );

  override readonly connect = async () => {
    if (this.#extension$.getValue() === undefined) {
      this.#extension$.next(await connectInjectedExtension(this.name));
      this.storage.setItem(`wallet/${this.id}/connected`, JSON.stringify(true));
    }
  };

  override readonly disconnect = () => {
    this.#extension$.getValue()?.disconnect();
    this.#extension$.next(undefined);
    this.storage.removeItem(`wallet/${this.id}/connected`);
  };

  override readonly accounts$ = this.#extension$.pipe(
    switchMap(
      (extension) =>
        new Observable<InjectedPolkadotAccount[]>((subscriber) => {
          if (extension === undefined) {
            subscriber.next([]);
          } else {
            subscriber.add(
              extension.subscribe((accounts) => subscriber.next(accounts)),
            );
          }
        }),
    ),
  );

  override readonly getAccounts = () => {
    const extension = this.#extension$.getValue();

    if (extension === undefined) {
      throw new ReDotError("Extension is not connected");
    }

    return extension.getAccounts();
  };
}
