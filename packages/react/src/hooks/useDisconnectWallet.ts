import { walletsAtom } from "../stores/wallets.js";
import { useAsyncState } from "./useAsyncState.js";
import { MutationError, PENDING, disconnectWallet } from "@reactive-dot/core";
import type { Wallet } from "@reactive-dot/core/wallets.js";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for disconnecting wallets
 *
 * @param wallets - Wallets to disconnect from, will disconnect from all connected wallets if none is specified
 * @returns The wallet disconnection state & disconnect function
 */
export const useDisconnectWallet = (wallets?: Wallet | Wallet[]) => {
  const hookWallets = wallets;

  const [state, setState] = useAsyncState<true>();

  const disconnect = useAtomCallback(
    useCallback(
      async (get, _, wallets?: Wallet | Wallet[]) => {
        try {
          setState(PENDING);
          const walletsToDisconnect =
            wallets ?? hookWallets ?? (await get(walletsAtom));
          await disconnectWallet(walletsToDisconnect);
          setState(true);
        } catch (error) {
          setState(MutationError.from(error));
        }
      },
      [hookWallets, setState],
    ),
  );

  return [state, disconnect] as [
    disconnectionState: typeof state,
    disconnect: typeof disconnect,
  ];
};
