import { walletsAtom } from "../stores/wallets.js";
import { useAsyncState } from "./use-async-state.js";
import { MutationError, pending, connectWallet } from "@reactive-dot/core";
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

  const [success, setSuccess] = useAsyncState<true>();

  const connect = useAtomCallback(
    useCallback(
      async (get, _, wallets?: Wallet | Wallet[]) => {
        try {
          setSuccess(pending);
          const walletsToConnect =
            wallets ?? hookWallets ?? (await get(walletsAtom));
          await connectWallet(walletsToConnect);
          setSuccess(true);
        } catch (error) {
          setSuccess(MutationError.from(error));
        }
      },
      [hookWallets, setSuccess],
    ),
  );

  return [success, connect] as [
    success: typeof success,
    connect: typeof connect,
  ];
}
