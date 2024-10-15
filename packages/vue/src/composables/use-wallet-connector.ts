import { useAsyncAction } from "./use-async-action.js";
import { useWalletsObservable } from "./use-wallets.js";
import { connectWallet } from "@reactive-dot/core";
import type { Wallet } from "@reactive-dot/core/wallets.js";
import { lastValueFrom } from "rxjs";

/**
 * Composable for connecting wallets
 *
 * @param wallets - Wallets to connect to, will connect to all available wallets if none is specified
 * @returns The wallet connection state & connect function
 */
export function useWalletConnector(wallets?: Wallet | Wallet[]) {
  const composableWallets = wallets;

  const walletsObservable = useWalletsObservable();

  return useAsyncAction(async (wallets?: Wallet | Wallet[]) => {
    const walletsToConnect =
      wallets ??
      composableWallets ??
      (await lastValueFrom(walletsObservable.value));

    await connectWallet(walletsToConnect);
  });
}
