import { useWallets } from "./use-wallets.js";
import {
  idle,
  pending,
  type AsyncValue,
  type ReactiveDotError,
} from "@reactive-dot/core";
import { initializeWallets } from "@reactive-dot/core/internal/actions.js";
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
    await initializeWallets(wallets);
  }, [wallets]);

  return [state, initialize] as [
    state: typeof state,
    initialize: typeof initialize,
  ];
}
