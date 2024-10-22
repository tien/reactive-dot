import { chainIdKey } from "../keys.js";
import type { ChainComposableOptions } from "../types.js";
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
 * @returns The current chain ID
 */
export function useChainId() {
  const injectedChainId = inject(chainIdKey);

  return computed(() => {
    const chainId = toValue(injectedChainId);

    if (chainId === undefined) {
      throw new ReactiveDotError("No chain ID provided");
    }

    return chainId as ChainId;
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
  const injectedChainId = inject(chainIdKey);

  return computed(() => {
    const chainId = options?.chainId ?? toValue(injectedChainId);

    if (!optionalChainId && chainId === undefined) {
      throw new ReactiveDotError("No chain ID provided");
    }

    return chainId as TOptionalChainId extends false
      ? ChainId
      : ChainId | undefined;
  });
}
