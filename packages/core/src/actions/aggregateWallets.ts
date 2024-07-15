import type { MaybeAsync } from "../types.js";
import { toObservable } from "../utils.js";
import type { WalletAggregator } from "../wallets/index.js";
import { combineLatest, from } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export function aggregateWallets(aggregators: MaybeAsync<WalletAggregator[]>) {
  return toObservable(aggregators).pipe(
    switchMap((aggregators) =>
      from(
        Promise.all(
          aggregators.map(async (aggregator) => {
            await aggregator.scan();
            return aggregator;
          }),
        ),
      ),
    ),
    switchMap((aggregators) =>
      combineLatest(aggregators.map((aggregator) => aggregator.wallets$)),
    ),
    map((wallets) => wallets.flat()),
  );
}
