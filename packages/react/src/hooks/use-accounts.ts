import { accountsAtom } from "../stores/accounts.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { useAtomValue } from "jotai";

/**
 * Hook for getting currently connected accounts.
 *
 * @param options - Additional options
 * @returns The currently connected accounts
 */
export function useAccounts(options?: ChainHookOptions) {
  return useAtomValue(
    accountsAtom({
      config: useConfig(),
      chainId: internal_useChainId({ ...options, optionalChainId: true }),
    }),
  );
}
