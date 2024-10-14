import { configKey } from "../keys.js";
import type { ChainComposableOptions } from "./types.js";
import { useChainId } from "./use-chain-id.js";
import { ReactiveDotError } from "@reactive-dot/core";
import { computed, inject, toValue } from "vue";

/**
 * Composable for getting the current config.
 *
 * @returns The current config
 */
export function useConfig() {
  const config = inject(configKey);

  return computed(() => {
    if (config === undefined) {
      throw new ReactiveDotError("No config provided");
    }

    return toValue(config);
  });
}

/**
 * @internal
 */
export function useChainConfig(options?: ChainComposableOptions) {
  const config = useConfig();
  const chainId = useChainId();

  return computed(() => {
    const chainConfig =
      config.value.chains[toValue(options?.chainId) ?? chainId.value];

    if (chainConfig === undefined) {
      throw new ReactiveDotError("No chain's config found", {
        cause: options?.chainId ?? chainId.value,
      });
    }

    return chainConfig;
  });
}
