import { clientAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import useChainId from "./useChainId.js";
import { useAtomValue } from "jotai";

/**
 * Hook for getting Polkadot-API client instance.
 *
 * @param options - Additional options
 * @returns Polkadot-API client
 */
export function useClient(options?: ChainHookOptions) {
  return useAtomValue(clientAtomFamily(useChainId(options)));
}
