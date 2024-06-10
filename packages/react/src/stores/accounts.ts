import { walletsAtom } from "./wallets.js";
import { atomWithObservable } from "jotai/utils";
import { combineLatest, from } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export const accountsAtom = atomWithObservable((get) =>
  from(get(walletsAtom))
    .pipe(
      switchMap((wallets) =>
        combineLatest(wallets.map((wallet) => wallet.accounts$)),
      ),
    )
    .pipe(map((wallets) => wallets.flat())),
);
