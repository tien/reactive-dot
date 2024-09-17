import { walletsAtom } from "../stores/wallets.js";
import { useAsyncState } from "./use-async-state.js";
import { useConfig } from "./use-config.js";
import { MutationError, pending, disconnectWallet } from "@reactive-dot/core";
import type { Wallet } from "@reactive-dot/core/wallets.js";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for disconnecting wallets
 *
 * @param wallets - Wallets to disconnect from, will disconnect from all connected wallets if none is specified
 * @returns The wallet disconnection state & disconnect function
 */
export function useWalletDisconnector(wallets?: Wallet | Wallet[]) {
  const hookWallets = wallets;

  const config = useConfig();
  const [success, setSuccess] = useAsyncState<true>();

  const disconnect = useAtomCallback(
    useCallback(
      async (get, _, wallets?: Wallet | Wallet[]) => {
        try {
          setSuccess(pending);
          const walletsToDisconnect =
            wallets ?? hookWallets ?? (await get(walletsAtom(config)));
          await disconnectWallet(walletsToDisconnect);
          setSuccess(true);
        } catch (error) {
          setSuccess(MutationError.from(error));
        }
      },
      [config, hookWallets, setSuccess],
    ),
  );

  return [success, disconnect] as [
    success: typeof success,
    disconnect: typeof disconnect,
  ];
}
