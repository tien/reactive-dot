import type { MaybeAsync } from "../types.js";
import { toObservable } from "../utils/to-observable.js";
import type { WalletProvider } from "../wallets/index.js";
import { combineLatest, from, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export function aggregateWallets(providers: MaybeAsync<WalletProvider[]>) {
  return toObservable(providers).pipe(
    switchMap((providers) => {
      if (providers.length === 0) {
        return of([]);
      }

      return from(
        Promise.all(
          providers.map(async (provider) => {
            await provider.scan();
            return provider;
          }),
        ),
      );
    }),
    switchMap((providers) =>
      combineLatest(providers.map((provider) => provider.wallets$)),
    ),
    map((wallets) => wallets.flat()),
  );
}
