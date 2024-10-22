import type { MaybeAsync } from "../types.js";
import { toObservable } from "../utils/to-observable.js";
import type { Wallet } from "../wallets/wallet.js";
import { combineLatest, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export function getConnectedWallets(wallets: MaybeAsync<Wallet[]>) {
  return toObservable(wallets).pipe(
    switchMap((wallets) => {
      if (wallets.length === 0) {
        return of([]);
      }

      return combineLatest(
        wallets.map((wallet) =>
          wallet.connected$.pipe(
            map((connected) => [wallet, connected] as const),
          ),
        ),
      );
    }),
    map((wallets) =>
      wallets.filter(([_, connected]) => connected).map(([wallet]) => wallet),
    ),
  );
}
