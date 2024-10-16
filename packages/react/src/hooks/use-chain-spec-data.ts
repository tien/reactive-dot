import { chainSpecDataAtom } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { useAtomValue } from "jotai";

/**
 * Hook for fetching the [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html).
 *
 * @param options - Additional options
 * @returns The [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html)
 */
export function useChainSpecData(options?: ChainHookOptions) {
  return useAtomValue(
    chainSpecDataAtom({
      config: useConfig(),
      chainId: internal_useChainId(options),
    }),
  );
}
