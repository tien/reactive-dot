import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";

/**
 * @internal
 */
export function useDescriptor(options?: ChainHookOptions) {
  const config = useConfig();
  const chainId = internal_useChainId({ ...options, optionalChainId: true });

  if (chainId === undefined) {
    return undefined;
  }

  return config.chains[chainId]?.descriptor;
}
