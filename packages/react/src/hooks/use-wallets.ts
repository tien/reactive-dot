import { connectedWalletsAtom, walletsAtom } from "../stores/wallets.js";
import { useConfig } from "./use-config.js";
import { useAtomValue } from "jotai";

/**
 * Hook for getting all available wallets.
 *
 * @returns Available wallets
 */
export function useWallets() {
  return useAtomValue(walletsAtom(useConfig()));
}

/**
 * Hook for getting all connected wallets.
 *
 * @returns Connected wallets
 */
export function useConnectedWallets() {
  return useAtomValue(connectedWalletsAtom(useConfig()));
}
