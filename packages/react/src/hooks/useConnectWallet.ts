import { walletsAtom } from "../stores/wallets.js";
import { useAsyncState } from "./useAsyncState.js";
import { MutationError, PENDING, connectWallet } from "@reactive-dot/core";
import { Wallet } from "@reactive-dot/core/wallets.js";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for connecting wallets
 *
 * @param wallets - Wallets to connect to, will connect to all available wallets if none is specified
 * @returns The wallet connection state & connect function
 */
export const useConnectWallet = (wallets?: Wallet | Wallet[]) => {
  const hookWallets = wallets;

  const [state, setState] = useAsyncState<true>();

  const connect = useAtomCallback(
    useCallback(
      async (get, _, wallets?: Wallet | Wallet[]) => {
        try {
          setState(PENDING);
          const walletsToConnect =
            wallets ?? hookWallets ?? (await get(walletsAtom));
          await connectWallet(walletsToConnect);
          setState(true);
        } catch (error) {
          setState(MutationError.from(error));
        }
      },
      [hookWallets, setState],
    ),
  );

  return [state, connect] as [
    connectionState: typeof state,
    connect: typeof connect,
  ];
};
