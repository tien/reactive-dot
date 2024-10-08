import { clientAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { useAtomValue } from "jotai";

/**
 * Hook for getting Polkadot-API client instance.
 *
 * @param options - Additional options
 * @returns Polkadot-API client
 */
export function useClient(options?: ChainHookOptions) {
  return useAtomValue(
    clientAtomFamily({
      config: useConfig(),
      chainId: internal_useChainId(options),
    }),
  );
}
