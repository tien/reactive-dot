import type { KeyedStorage } from "../../storage.js";
import InjectedWallet from "../injected.js";
import WalletAggregator from "./aggregator.js";
import { getInjectedExtensions } from "polkadot-api/pjs-signer";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

export default class InjectedAggregator extends WalletAggregator {
  #storage: KeyedStorage | undefined;

  constructor(options?: { storage?: KeyedStorage }) {
    super();
    this.#storage = options?.storage;
  }

  readonly #walletMap$ = new BehaviorSubject(new Map<string, InjectedWallet>());

  readonly wallets$ = this.#walletMap$.pipe(
    map((walletMap) => Array.from(walletMap.values())),
  );

  override readonly scan = () => {
    const injectedNames = getInjectedExtensions() ?? [];

    const current = new Map(this.#walletMap$.value);

    for (const name of injectedNames) {
      if (!current.has(name)) {
        current.set(
          name,
          new InjectedWallet(
            name,
            this.#storage === undefined
              ? undefined
              : { storage: this.#storage },
          ),
        );
      }
    }

    this.#walletMap$.next(current);

    return Array.from(current.values());
  };
}
