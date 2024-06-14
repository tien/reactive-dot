import { KeyedStorage } from "../../storage.js";
import InjectedWallet from "../injected.js";
import WalletAggregator from "./aggregator.js";
import { getInjectedExtensions } from "polkadot-api/pjs-signer";
import { BehaviorSubject } from "rxjs";

export default class InjectedAggregator extends WalletAggregator {
  #storage: KeyedStorage | undefined;

  constructor(options?: { storage?: KeyedStorage }) {
    super();
    this.#storage = options?.storage;
  }

  readonly wallets$ = new BehaviorSubject<InjectedWallet[]>([]);

  override readonly getWallets = () => this.wallets$.getValue();

  override readonly scan = () => {
    const wallets =
      getInjectedExtensions()?.map(
        (name) =>
          new InjectedWallet(
            name,
            this.#storage === undefined
              ? undefined
              : { storage: this.#storage },
          ),
      ) ?? [];

    this.wallets$.next(wallets);

    return wallets;
  };
}
