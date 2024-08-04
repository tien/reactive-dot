import { WalletAggregator } from "../aggregator.js";
import type { WalletOptions } from "../wallet.js";
import { InjectedWallet } from "./wallet.js";
import { getInjectedExtensions } from "polkadot-api/pjs-signer";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

export class InjectedWalletAggregator extends WalletAggregator {
  #walletOptions: WalletOptions | undefined;

  constructor(options?: WalletOptions) {
    super();
    this.#walletOptions = options;
  }

  readonly #walletMap$ = new BehaviorSubject(new Map<string, InjectedWallet>());

  readonly wallets$ = this.#walletMap$.pipe(
    map((walletMap) => Array.from(walletMap.values())),
  );

  override scan() {
    const injectedNames = getInjectedExtensions() ?? [];

    const current = new Map(this.#walletMap$.value);

    for (const name of injectedNames) {
      if (!current.has(name)) {
        current.set(name, new InjectedWallet(name, this.#walletOptions));
      }
    }

    this.#walletMap$.next(current);

    return Array.from(current.values());
  }
}
