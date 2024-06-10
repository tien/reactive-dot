import { ChainIdContext } from "../context.js";
import { clientAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { ReDotError } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import { useContext } from "react";

/**
 * Hook for getting Polkadot-API client instance.
 *
 * @param options - Additional options
 * @returns Polkadot-API client
 */
export const useClient = (options?: ChainHookOptions) => {
  const defaultChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? defaultChainId;

  if (chainId === undefined) {
    throw new ReDotError("No chain ID provided");
  }

  return useAtomValue(clientAtomFamily(chainId));
};
