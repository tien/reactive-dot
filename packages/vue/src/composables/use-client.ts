import type { ChainComposableOptions } from "./types.js";
import { useAsyncData, useLazyValue } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useChainConfig } from "./use-config.js";
import { getClient } from "@reactive-dot/core";
import { computed, toValue } from "vue";

/**
 * Hook for getting Polkadot-API client instance.
 *
 * @param options - Additional options
 * @returns Polkadot-API client
 */
export function useClient(options?: ChainComposableOptions) {
  return useAsyncData(useClientPromise(options));
}

/**
 * @internal
 */
export function useClientPromise(options?: ChainComposableOptions) {
  const chainId = internal_useChainId(options);
  const chainConfig = useChainConfig(options);

  return useLazyValue(
    computed(() => `client-${chainId.value}`),
    computed(() => {
      const chainConfigValue = toValue(chainConfig);
      return () => getClient(chainConfigValue);
    }),
  );
}