import { useAsyncAction } from "./use-async-action.js";
import { useWalletsPromise } from "./use-wallets.js";
import { connectWallet } from "@reactive-dot/core/internal/actions.js";
import type { Wallet } from "@reactive-dot/core/wallets.js";

/**
 * Composable for connecting wallets
 *
 * @param wallets - Wallets to connect to, will connect to all available wallets if none is specified
 * @returns The wallet connection state & connect function
 */
export function useWalletConnector(wallets?: Wallet | Wallet[]) {
  const composableWallets = wallets;

  const walletsPromise = useWalletsPromise();

  return useAsyncAction(async (wallets?: Wallet | Wallet[]) => {
    const walletsToConnect =
      wallets ?? composableWallets ?? (await walletsPromise.value);

    await connectWallet(walletsToConnect);
  });
}
