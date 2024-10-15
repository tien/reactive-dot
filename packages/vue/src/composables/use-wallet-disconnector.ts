import { useAsyncAction } from "./use-async-action.js";
import { useConnectedWalletsObservable } from "./use-wallets.js";
import { disconnectWallet } from "@reactive-dot/core";
import type { Wallet } from "@reactive-dot/core/wallets.js";
import { lastValueFrom } from "rxjs";

/**
 * Composable for disconnecting wallets
 *
 * @param wallets - Wallets to disconnect from, will disconnect from all connected wallets if none is specified
 * @returns The wallet disconnection state & disconnect function
 */
export function useWalletDisconnector(wallets?: Wallet | Wallet[]) {
  const composableWallets = wallets;

  const connectedWalletsObservable = useConnectedWalletsObservable();

  return useAsyncAction(async (wallets?: Wallet | Wallet[]) => {
    const walletsToDisconnect =
      wallets ??
      composableWallets ??
      (await lastValueFrom(connectedWalletsObservable.value));

    await disconnectWallet(walletsToDisconnect);
  });
}
