import { ChainIdContext } from "../contexts/chain.js";
import type { ChainHookOptions } from "./types.js";
import { useConfig } from "./use-config.js";
import { type ChainId, ReactiveDotError } from "@reactive-dot/core";
import { use } from "react";

/**
 * Hook for getting all configured chain IDs.
 *
 * @returns All configured chain IDs
 */
export function useChainIds() {
  return Object.keys(useConfig().chains) as ChainId[];
}

/**
 * Hook for getting the current chain ID.
 *
 * @returns The current chain ID
 */
export function useChainId() {
  const chainId = use(ChainIdContext);

  if (chainId === undefined) {
    throw new ReactiveDotError("No chain ID provided");
  }

  return chainId as ChainId;
}

/**
 * @internal
 */
export function internal_useChainId<TOptionalChainId extends boolean = false>({
  optionalChainId = false as TOptionalChainId,
  ...options
}: ChainHookOptions & {
  optionalChainId?: TOptionalChainId;
} = {}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const contextChainId = use(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (!optionalChainId && chainId === undefined) {
    throw new ReactiveDotError("No chain ID provided");
  }

  return chainId as TOptionalChainId extends false
    ? ChainId
    : ChainId | undefined;
}
