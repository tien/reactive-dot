import type { ChainComposableOptions } from "../types.js";
import { useAsyncData } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useClientPromise } from "./use-client.js";
import { useLazyValue } from "./use-lazy-value.js";
import { computed } from "vue";

/**
 * Composable for fetching the [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html).
 *
 * @param options - Additional options
 * @returns The [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html)
 */
export function useChainSpecData(options?: ChainComposableOptions) {
  return useAsyncData(useChainSpecDataPromise(options));
}

/**
 * @internal
 */
export function useChainSpecDataPromise(options?: ChainComposableOptions) {
  const chainId = internal_useChainId(options);
  const clientPromise = useClientPromise(options);

  return useLazyValue(
    computed(() => ["chain-spec", chainId.value]),
    () => clientPromise.value.then((client) => client.getChainSpecData()),
  );
}
