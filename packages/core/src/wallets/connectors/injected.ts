import InjectedWallet from "../injected.js";
import Connector from "./connector.js";
import { getInjectedExtensions } from "polkadot-api/pjs-signer";
import { BehaviorSubject } from "rxjs";

export default class InjectedConnector extends Connector {
  readonly wallets$ = new BehaviorSubject<InjectedWallet[]>([]);

  override readonly getWallets = () => this.wallets$.getValue();

  override readonly scan = () => {
    const wallets =
      getInjectedExtensions()?.map((name) => new InjectedWallet(name)) ?? [];

    this.wallets$.next(wallets);

    return wallets;
  };
}
