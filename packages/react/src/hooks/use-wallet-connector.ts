import { useAsyncAction } from "./use-async-action.js";
import { useConfig } from "./use-config.js";
import { walletsAtom } from "./use-wallets.js";
import { connectWallet } from "@reactive-dot/core/internal/actions.js";
import type { Wallet } from "@reactive-dot/core/wallets.js";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for connecting wallets
 *
 * @param wallets - Wallets to connect to, will connect to all available wallets if none is specified
 * @returns The wallet connection state & connect function
 */
export function useWalletConnector(wallets?: Wallet | Wallet[]) {
  const hookWallets = wallets;
  const config = useConfig();

  return useAsyncAction(
    useAtomCallback(
      useCallback(
        async (get, _, wallets?: Wallet | Wallet[]) => {
          const walletsToConnect =
            wallets ?? hookWallets ?? (await get(walletsAtom(config)));
          await connectWallet(walletsToConnect);
          return true as const;
        },
        [config, hookWallets],
      ),
    ),
  );
}
