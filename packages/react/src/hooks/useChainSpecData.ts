import { ChainIdContext } from "../context.js";
import { chainSpecDataAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { ReDotError } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import { useContext } from "react";

/**
 * Hook for fetching the [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html).
 *
 * @param options - Additional options
 * @returns The [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html)
 */
export const useChainSpecData = (options?: ChainHookOptions) => {
  const contextChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (chainId === undefined) {
    throw new ReDotError("No chain Id provided");
  }

  return useAtomValue(chainSpecDataAtomFamily(chainId));
};
