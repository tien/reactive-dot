import { chainIdKey } from "../keys.js";
import type { ChainComposableOptions } from "./types.js";
import { useConfig } from "./use-config.js";
import { type ChainId, ReactiveDotError } from "@reactive-dot/core";
import { computed, inject, toValue } from "vue";

/**
 * Composable for getting all configured chain IDs.
 *
 * @returns All configured chain IDs
 */
export function useChainIds() {
  return computed(() => Object.keys(toValue(useConfig()).chains) as ChainId[]);
}

/**
 * Composable for getting the current chain ID.
 *
 * @param options - Additional options
 * @returns The current chain ID
 */
export function useChainId<
  const TAllowList extends ChainId[],
  const TDenylist extends ChainId[] = [],
>(options?: { allowlist?: TAllowList; denylist?: TDenylist }) {
  return computed(() => {
    const chainId = toValue(inject(chainIdKey));

    if (chainId === undefined) {
      throw new ReactiveDotError("No chain ID provided");
    }

    if (options?.allowlist?.includes(chainId) === false) {
      throw new ReactiveDotError("Chain ID not allowed", { cause: chainId });
    }

    if (options?.denylist?.includes(chainId)) {
      throw new ReactiveDotError("Chain ID denied", { cause: chainId });
    }

    return chainId as Exclude<
      Extract<ChainId, TAllowList[number]>,
      TDenylist[number]
    >;
  });
}

/**
 * @internal
 */
export function internal_useChainId<TOptionalChainId extends boolean = false>({
  optionalChainId = false as TOptionalChainId,
  ...options
}: ChainComposableOptions & {
  optionalChainId?: TOptionalChainId;
} = {}) {
  return computed(() => {
    const injectedChainId = toValue(inject(chainIdKey));
    const chainId = options?.chainId ?? injectedChainId;

    if (!optionalChainId && chainId === undefined) {
      throw new ReactiveDotError("No chain ID provided");
    }

    return chainId as TOptionalChainId extends false
      ? ChainId
      : ChainId | undefined;
  });
}
