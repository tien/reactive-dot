import type { WalletAggregator, Wallet } from "@reactive-dot/core/wallets.js";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { combineLatest, from } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export const aggregatorAtom = atom<WalletAggregator[]>([]);

const aggregatorWallets = atomWithObservable((get) =>
  from(
    Promise.all(
      get(aggregatorAtom).map(async (aggregator) => {
        await aggregator.scan();
        return aggregator;
      }),
    ),
  )
    .pipe(
      switchMap((aggregators) =>
        combineLatest(aggregators.map((aggregator) => aggregator.wallets$)),
      ),
    )
    .pipe(map((wallets) => wallets.flat())),
);

export const directWalletsAtom = atom<Wallet[]>([]);

export const walletsAtom = atom(async (get) => [
  ...get(directWalletsAtom),
  ...(await get(aggregatorWallets)),
]);

export const connectedWalletsAtom = atomWithObservable((get) =>
  from(get(walletsAtom))
    .pipe(
      switchMap((wallets) =>
        combineLatest(
          wallets.map((wallet) =>
            wallet.connected$.pipe(
              map((connected) => [wallet, connected] as const),
            ),
          ),
        ),
      ),
    )
    .pipe(
      map((wallets) =>
        wallets.filter(([_, connected]) => connected).map(([wallet]) => wallet),
      ),
    ),
);
