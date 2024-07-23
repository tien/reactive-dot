import { accountsAtom } from "../stores/accounts.js";
import type { ChainHookOptions } from "./types.js";
import { useChainId } from "./use-chain-id.js";
import { useAtomValue } from "jotai";

/**
 * Hook for getting currently connected accounts.
 *
 * @param options - Additional options
 * @returns The currently connected accounts
 */
export function useAccounts(options?: ChainHookOptions) {
  return useAtomValue(accountsAtom(useChainId(options)));
}
