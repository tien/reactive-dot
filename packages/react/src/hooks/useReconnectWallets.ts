import { useWallets } from "./useWallets.js";
import {
  IDLE,
  PENDING,
  type AsyncState,
  type ReDotError,
} from "@reactive-dot/core";
import { initializeWallets } from "@reactive-dot/core/wallets.js";
import { useCallback, useState } from "react";

/**
 * Hook for reconnecting wallets.
 *
 * @returns The reconnection state and reconnect function
 */
export function useReconnectWallets() {
  const wallets = useWallets();

  const [state, setState] = useState<AsyncState<true, ReDotError>>(IDLE);

  const reconnect = useCallback(async () => {
    setState(PENDING);
    initializeWallets(wallets);
  }, [wallets]);

  return [state, reconnect] as [
    state: typeof state,
    reconnect: typeof reconnect,
  ];
}
