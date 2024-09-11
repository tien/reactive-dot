import { useWallets } from "./use-wallets.js";
import {
  IDLE,
  PENDING,
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

  const [state, setState] = useState<AsyncValue<true, ReDotError>>(IDLE);

  const initialize = useCallback(async () => {
    setState(PENDING);
    initializeWallets(wallets);
  }, [wallets]);

  return [state, initialize] as [
    state: typeof state,
    initialize: typeof initialize,
  ];
}
