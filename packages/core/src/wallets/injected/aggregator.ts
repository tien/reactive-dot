import { WalletAggregator } from "../aggregator.js";
import { InjectedWallet, type InjectedWalletOptions } from "./wallet.js";
import { getInjectedExtensions } from "polkadot-api/pjs-signer";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

export class InjectedWalletAggregator extends WalletAggregator {
  constructor(private readonly options?: InjectedWalletOptions) {
    super();
  }

  readonly #walletMap$ = new BehaviorSubject(new Map<string, InjectedWallet>());

  readonly wallets$ = this.#walletMap$.pipe(
    map((walletMap) => Array.from(walletMap.values())),
  );

  scan() {
    const injectedNames = getInjectedExtensions() ?? [];

    const current = new Map(this.#walletMap$.value);

    for (const name of injectedNames) {
      if (!current.has(name)) {
        current.set(name, new InjectedWallet(name, this.options));
      }
    }

    this.#walletMap$.next(current);

    return Array.from(current.values());
  }
}
