import { ChainIdContext } from "../contexts/index.js";
import { chainConfigsAtom } from "../stores/config.js";
import type { ChainHookOptions } from "./types.js";
import { type ChainId, ReDotError } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import { useContext } from "react";

/**
 * Hook for getting all configured chain IDs.
 *
 * @returns All configured chain IDs
 */
export function useChainIds() {
  return Object.keys(useAtomValue(chainConfigsAtom)) as ChainId[];
}

/**
 * Hook for getting the current chain ID.
 *
 * @param options - Additional options
 * @returns The current chain ID
 */
export function useChainId<
  const TAllowList extends ChainId[],
  const TDenylist extends ChainId[] = [],
>(options?: { allowlist?: TAllowList; denylist?: TDenylist }) {
  const chainId = useContext(ChainIdContext);

  if (chainId === undefined) {
    throw new ReDotError("No chain ID provided");
  }

  if (options?.allowlist?.includes(chainId) === false) {
    throw new ReDotError("Chain ID not allowed", { cause: chainId });
  }

  if (options?.denylist?.includes(chainId)) {
    throw new ReDotError("Chain ID denied", { cause: chainId });
  }

  return chainId as Exclude<
    Extract<ChainId, TAllowList[number]>,
    TDenylist[number]
  >;
}

export function useChainId_INTERNAL(options?: ChainHookOptions) {
  const contextChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (chainId === undefined) {
    throw new ReDotError("No chain ID provided");
  }

  return chainId;
}
