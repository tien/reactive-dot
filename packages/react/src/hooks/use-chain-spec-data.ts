import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import type { ChainHookOptions } from "./types.js";
import { useAtomValue } from "./use-atom-value.js";
import { internal_useChainId } from "./use-chain-id.js";
import { clientAtom } from "./use-client.js";
import { useConfig } from "./use-config.js";
import type { Config, ChainId } from "@reactive-dot/core";
import { atom } from "jotai";

/**
 * Hook for fetching the [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html).
 *
 * @param options - Additional options
 * @returns The [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html)
 */
export function useChainSpecData(options?: ChainHookOptions) {
  return useAtomValue(
    chainSpecDataAtom(useConfig(), internal_useChainId(options)),
  );
}

/**
 * @internal
 */
export const chainSpecDataAtom = atomFamilyWithErrorCatcher(
  (withErrorCatcher, config: Config, chainId: ChainId) =>
    withErrorCatcher(
      atom(async (get) => {
        const client = await get(clientAtom(config, chainId));

        return client.getChainSpecData();
      }),
    ),
);
