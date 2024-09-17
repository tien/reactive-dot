import { ChainIdContext } from "../contexts/index.js";
import type { ChainHookOptions } from "./types.js";
import { useConfig } from "./use-config.js";
import { type ChainId, ReDotError } from "@reactive-dot/core";
import { useContext } from "react";

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
  const contextChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (!optionalChainId && chainId === undefined) {
    throw new ReDotError("No chain ID provided");
  }

  return chainId as TOptionalChainId extends false
    ? ChainId
    : ChainId | undefined;
}
