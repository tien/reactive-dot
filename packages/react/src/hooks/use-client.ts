import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import type { ChainHookOptions } from "./types.js";
import { useAtomValue } from "./use-atom-value.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import type { ChainId, Config } from "@reactive-dot/core";
import { ReactiveDotError } from "@reactive-dot/core";
import { getClient } from "@reactive-dot/core/internal/actions.js";
import { atom } from "jotai";

/**
 * Hook for getting Polkadot-API client instance.
 *
 * @param options - Additional options
 * @returns Polkadot-API client
 */
export function useClient(options?: ChainHookOptions) {
  return useAtomValue(clientAtom(useConfig(), internal_useChainId(options)));
}

/**
 * @internal
 */
export const clientAtom = atomFamilyWithErrorCatcher(
  (withErrorCatcher, config: Config, chainId: ChainId) =>
    withErrorCatcher(
      atom(() => {
        const chainConfig = config.chains[chainId];

        if (chainConfig === undefined) {
          throw new ReactiveDotError(`No config provided for ${chainId}`);
        }

        return getClient(chainConfig);
      }),
    ),
);
