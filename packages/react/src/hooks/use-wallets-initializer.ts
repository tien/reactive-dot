import { useWallets } from "./use-wallets.js";
import {
  idle,
  pending,
  type AsyncValue,
  type ReDotError,
} from "@reactive-dot/core";
import { initializeWallets } from "@reactive-dot/core/wallets.js";
import { useCallback, useState } from "react";

/**
 * Hook for initializing wallets.
 *
 * @returns The initialization state and initialize function
 */
export function useWalletsInitializer() {
  const wallets = useWallets();

  const [state, setState] = useState<AsyncValue<true, ReDotError>>(idle);

  const initialize = useCallback(async () => {
    setState(pending);
    initializeWallets(wallets);
  }, [wallets]);

  return [state, initialize] as [
    state: typeof state,
    initialize: typeof initialize,
  ];
}
