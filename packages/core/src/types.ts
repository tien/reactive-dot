import type { Wallet } from "./wallets/wallet.js";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import type { Observable } from "rxjs";

export type Gettable<T> = T | PromiseLike<T> | (() => T | PromiseLike<T>);

export type MaybeAsync<T> = T | Promise<T> | Observable<T>;

export type PolkadotAccount = InjectedPolkadotAccount & { wallet: Wallet };
