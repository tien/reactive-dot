import { typedApiAtom } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import type { ChainId } from "@reactive-dot/core";
import type { ChainDescriptorOf } from "@reactive-dot/core/internal.js";
import { useAtomValue } from "jotai";
import type { TypedApi } from "polkadot-api";

/**
 * Hook for getting Polkadot-API typed API.
 *
 * @param options - Additional options
 * @returns Polkadot-API typed API
 */
export function useTypedApi<TChainId extends ChainId | undefined>(
  options?: ChainHookOptions<TChainId>,
) {
  return useAtomValue(
    typedApiAtom({
      config: useConfig(),
      chainId: internal_useChainId(options),
    }),
  ) as TypedApi<ChainDescriptorOf<TChainId>>;
}
