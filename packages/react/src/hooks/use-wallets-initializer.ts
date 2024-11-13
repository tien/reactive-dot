import { useWallets } from "./use-wallets.js";
import {
  idle,
  initializeWallets,
  pending,
  type AsyncValue,
  type ReactiveDotError,
} from "@reactive-dot/core";
import { useCallback, useState } from "react";

/**
 * Hook for initializing wallets.
 * @internal
 *
 * @returns The initialization state and initialize function
 */
export function useWalletsInitializer() {
  const wallets = useWallets();

  const [state, setState] = useState<AsyncValue<true, ReactiveDotError>>(idle);

  const initialize = useCallback(async () => {
    setState(pending);
    initializeWallets(wallets);
  }, [wallets]);

  return [state, initialize] as [
    state: typeof state,
    initialize: typeof initialize,
  ];
}
