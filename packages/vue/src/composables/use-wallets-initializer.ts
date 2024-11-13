import { useAsyncAction } from "./use-async-action.js";
import { useWalletsPromise } from "./use-wallets.js";
import { initializeWallets } from "@reactive-dot/core";

/**
 * Composable for initializing wallets.
 *
 * @returns The initialization state and initialize function
 */
export function useWalletsInitializer() {
  const walletsPromise = useWalletsPromise();

  return useAsyncAction(async () =>
    initializeWallets(await walletsPromise.value),
  );
}
