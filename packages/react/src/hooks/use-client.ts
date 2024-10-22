import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import type { ChainId, Config } from "@reactive-dot/core";
import { getClient, ReactiveDotError } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import { atom } from "jotai";

/**
 * Hook for getting Polkadot-API client instance.
 *
 * @param options - Additional options
 * @returns Polkadot-API client
 */
export function useClient(options?: ChainHookOptions) {
  return useAtomValue(
    clientAtom({
      config: useConfig(),
      chainId: internal_useChainId(options),
    }),
  );
}

/**
 * @internal
 */
export const clientAtom = atomFamilyWithErrorCatcher(
  (param: { config: Config; chainId: ChainId }, withErrorCatcher) =>
    withErrorCatcher(atom)(async () => {
      const chainConfig = param.config.chains[param.chainId];

      if (chainConfig === undefined) {
        throw new ReactiveDotError(`No config provided for ${param.chainId}`);
      }

      return getClient(chainConfig);
    }),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
