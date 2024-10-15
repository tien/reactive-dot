import type { ChainComposableOptions } from "./types.js";
import { useAsyncData } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useClientPromise } from "./use-client.js";
import { useChainConfig } from "./use-config.js";
import { useLazyValue } from "./use-lazy-value.js";
import type { ChainId, Chains } from "@reactive-dot/core";
import type { TypedApi } from "polkadot-api";
import { computed } from "vue";

/**
 * Composable for getting Polkadot-API typed API.
 *
 * @param options - Additional options
 * @returns Polkadot-API typed API
 */
export function useTypedApi<TChainId extends ChainId>(
  options?: ChainComposableOptions<TChainId>,
) {
  return useAsyncData(useTypedApiPromise(options));
}

/**
 * @internal
 */
export function useTypedApiPromise<TChainId extends ChainId>(
  options?: ChainComposableOptions<TChainId>,
) {
  const chainId = internal_useChainId(options);
  const chainConfig = useChainConfig(options);
  const clientPromise = useClientPromise(options);

  return useLazyValue(
    computed(() => `typed-api-${chainId.value}`),
    () =>
      clientPromise.value.then(
        (client) =>
          client.getTypedApi(chainConfig.value.descriptor) as TypedApi<
            Chains[TChainId]
          >,
      ),
  );
}
