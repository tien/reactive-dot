import { connectedWalletsAtom, walletsAtom } from "../stores/wallets.js";
import { useAtomValue } from "jotai";

/**
 * Hook for getting all available wallets.
 *
 * @returns Available wallets
 */
export const useWallets = () => useAtomValue(walletsAtom);

/**
 * Hook for getting all connected wallets.
 *
 * @returns Connected wallets
 */
export const useConnectedWallets = () => useAtomValue(connectedWalletsAtom);
