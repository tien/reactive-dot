import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { clientAtom } from "./use-client.js";
import { useConfig } from "./use-config.js";
import type { Config, ChainId } from "@reactive-dot/core";
import { atom } from "jotai";
import { useAtomValue } from "jotai-suspense";

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

/**
 * @internal
 */
export const chainSpecDataAtom = atomFamilyWithErrorCatcher(
  (param: { config: Config; chainId: ChainId }, withErrorCatcher) =>
    withErrorCatcher(atom)(async (get) => {
      const client = await get(clientAtom(param));

      return client.getChainSpecData();
    }),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
