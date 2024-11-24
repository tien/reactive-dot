import { useAsyncAction } from "./use-async-action.js";
import { useConfig } from "./use-config.js";
import { walletsAtom } from "./use-wallets.js";
import { disconnectWallet } from "@reactive-dot/core/internal/actions.js";
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

  return useAsyncAction(
    useAtomCallback(
      useCallback(
        async (get, _, wallets?: Wallet | Wallet[]) => {
          const walletsToDisconnect =
            wallets ?? hookWallets ?? (await get(walletsAtom(config)));
          await disconnectWallet(walletsToDisconnect);
          return true as const;
        },
        [config, hookWallets],
      ),
    ),
  );
}
