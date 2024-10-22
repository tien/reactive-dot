import type { MaybeAsync } from "../types.js";
import { toObservable } from "../utils/to-observable.js";
import type { WalletAggregator } from "../wallets/index.js";
import { combineLatest, from, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export function aggregateWallets(aggregators: MaybeAsync<WalletAggregator[]>) {
  return toObservable(aggregators).pipe(
    switchMap((aggregators) => {
      if (aggregators.length === 0) {
        return of([]);
      }

      return from(
        Promise.all(
          aggregators.map(async (aggregator) => {
            await aggregator.scan();
            return aggregator;
          }),
        ),
      );
    }),
    switchMap((aggregators) =>
      combineLatest(aggregators.map((aggregator) => aggregator.wallets$)),
    ),
    map((wallets) => wallets.flat()),
  );
}
