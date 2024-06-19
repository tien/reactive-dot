import { ChainIdContext } from "../context.js";
import { typedApiAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { ReDotError } from "@reactive-dot/core";
import type { Chains, ChainId, CommonDescriptor } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import type { TypedApi } from "polkadot-api";
import { useContext } from "react";

/**
 * Hook for getting Polkadot-API typed API.
 *
 * @param options - Additional options
 * @returns Polkadot-API typed API
 */
export const useTypedApi = <TChainId extends ChainId | void = void>(
  options?: ChainHookOptions,
): TypedApi<
  TChainId extends void ? CommonDescriptor : Chains[Exclude<TChainId, void>]
> => {
  const contextChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (chainId === undefined) {
    throw new ReDotError("No chain ID provided");
  }

  return useAtomValue(typedApiAtomFamily(chainId));
};
