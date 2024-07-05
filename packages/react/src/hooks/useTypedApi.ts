import { typedApiAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import useChainId from "./useChainId.js";
import type { ChainId, Chains, CommonDescriptor } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import type { TypedApi } from "polkadot-api";

/**
 * Hook for getting Polkadot-API typed API.
 *
 * @param options - Additional options
 * @returns Polkadot-API typed API
 */
export function useTypedApi<TChainId extends ChainId>(
  options?: ChainHookOptions<TChainId>,
): TypedApi<
  TChainId extends void ? CommonDescriptor : Chains[Exclude<TChainId, void>]
> {
  return useAtomValue(typedApiAtomFamily(useChainId(options)));
}
