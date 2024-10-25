import { useAsyncData } from "./use-async-data.js";
import { useConfig } from "./use-config.js";
import { useLazyValue } from "./use-lazy-value.js";
import { aggregateWallets, getConnectedWallets } from "@reactive-dot/core";
import { Wallet, WalletProvider } from "@reactive-dot/core/wallets.js";
import { map } from "rxjs/operators";

/**
 * Composable for getting all available wallets.
 *
 * @returns Available wallets
 */
export function useWallets() {
  return useAsyncData(useWalletsObservable());
}

/**
 * @internal
 */
export function useWalletsObservable() {
  const config = useConfig();

  return useLazyValue(["wallets"], () =>
    aggregateWallets(
      config.value.wallets?.filter(
        (wallet) => wallet instanceof WalletProvider,
      ) ?? [],
    ).pipe(
      map((aggregatedWallets) => [
        ...(config.value.wallets?.filter(
          (wallet) => wallet instanceof Wallet,
        ) ?? []),
        ...aggregatedWallets,
      ]),
    ),
  );
}

/**
 * Composable for getting all connected wallets.
 *
 * @returns Connected wallets
 */
export function useConnectedWallets() {
  return useAsyncData(useConnectedWalletsObservable());
}

/**
 * @internal
 */
export function useConnectedWalletsObservable() {
  return useLazyValue(["connected-wallets"], () =>
    getConnectedWallets(useWalletsObservable().value),
  );
}
