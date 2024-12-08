import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { clientAtom } from "./use-client.js";
import { useConfig } from "./use-config.js";
import {
  ReactiveDotError,
  type ChainId,
  type Config,
} from "@reactive-dot/core";
import type { ChainDescriptorOf } from "@reactive-dot/core/internal.js";
import { atom } from "jotai";
import { useAtomValue } from "jotai-suspense";
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
  ) as Promise<TypedApi<ChainDescriptorOf<TChainId>>>;
}

/**
 * @internal
 */
export const typedApiAtom = atomFamilyWithErrorCatcher(
  (param: { config: Config; chainId: ChainId }, withErrorCatcher) =>
    withErrorCatcher(atom)(async (get) => {
      const config = param.config.chains[param.chainId];

      if (config === undefined) {
        throw new ReactiveDotError(
          `No config provided for chain ${param.chainId}`,
        );
      }

      const client = await get(clientAtom(param));

      return client.getTypedApi(config.descriptor);
    }),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
