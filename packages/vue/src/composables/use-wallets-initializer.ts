import { useAsyncAction } from "./use-async-action.js";
import { useWalletsObservable } from "./use-wallets.js";
import { initializeWallets } from "@reactive-dot/core/wallets.js";
import { lastValueFrom } from "rxjs";

/**
 * Composable for initializing wallets.
 *
 * @returns The initialization state and initialize function
 */
export function useWalletsInitializer() {
  const walletsObservable = useWalletsObservable();

  return useAsyncAction(async () =>
    initializeWallets(await lastValueFrom(walletsObservable.value)),
  );
}
