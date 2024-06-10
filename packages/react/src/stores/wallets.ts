import type { Connector, Wallet } from "@reactive-dot/core/wallets.js";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { combineLatest, from } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export const connectorsAtom = atom<Connector[]>([]);

const connectorWallets = atomWithObservable((get) =>
  from(
    Promise.all(
      get(connectorsAtom).map(async (connector) => {
        await connector.scan();
        return connector;
      }),
    ),
  )
    .pipe(
      switchMap((connectors) =>
        combineLatest(connectors.map((connector) => connector.wallets$)),
      ),
    )
    .pipe(map((wallets) => wallets.flat())),
);

export const directWalletsAtom = atom<Wallet[]>([]);

export const walletsAtom = atom(async (get) => [
  ...get(directWalletsAtom),
  ...(await get(connectorWallets)),
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
