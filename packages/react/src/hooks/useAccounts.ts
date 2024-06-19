import { ChainIdContext } from "../context.js";
import { accountsAtom } from "../stores/accounts.js";
import type { ChainHookOptions } from "./types.js";
import { ReDotError } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import { useContext } from "react";

/**
 * Hook for getting currently connected accounts.
 *
 * @param options - Additional options
 * @returns The currently connected accounts
 */
export const useAccounts = (options?: ChainHookOptions) => {
  const contextChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (chainId === undefined) {
    throw new ReDotError("No chain Id provided");
  }

  return useAtomValue(accountsAtom(chainId));
};
