import { useAsyncData } from "./use-async-data.js";
import { useConfig } from "./use-config.js";
import { useLazyValue } from "./use-lazy-value.js";
import { aggregateWallets, getConnectedWallets } from "@reactive-dot/core";

/**
 * Composable for getting all available wallets.
 *
 * @returns Available wallets
 */
export function useWallets() {
  return useAsyncData(useWalletsPromise());
}

/**
 * @internal
 */
export function useWalletsPromise() {
  const config = useConfig();

  return useLazyValue(["wallets"], () =>
    aggregateWallets(config.value.wallets ?? []),
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
    getConnectedWallets(useWalletsPromise().value),
  );
}
