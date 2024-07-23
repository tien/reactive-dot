import type { MaybeAsync } from "../types.js";
import { toObservable } from "../utils.js";
import type { Wallet } from "../wallets/wallet.js";
import { combineLatest } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export function getConnectedWallets(wallets: MaybeAsync<Wallet[]>) {
  return toObservable(wallets).pipe(
    switchMap((wallets) =>
      combineLatest(
        wallets.map((wallet) =>
          wallet.connected$.pipe(
            map((connected) => [wallet, connected] as const),
          ),
        ),
      ),
    ),
    map((wallets) =>
      wallets.filter(([_, connected]) => connected).map(([wallet]) => wallet),
    ),
  );
}
