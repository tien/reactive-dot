import { DANGEROUS_ClientContext } from "../contexts/chain.js";
import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import type { ChainId, Config } from "@reactive-dot/core";
import { getClient, ReactiveDotError } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import { atom } from "jotai";
import { useContext } from "react";

/**
 * Hook for getting Polkadot-API client instance.
 *
 * @param options - Additional options
 * @returns Polkadot-API client
 */
export function useClient(options?: ChainHookOptions) {
  return useMaybeClient({ ...options, optionalChainId: false })!;
}

/**
 * @internal
 */
export function useMaybeClient({
  optionalChainId = true,
  ...options
}: ChainHookOptions & { optionalChainId?: boolean } = {}) {
  const dangerous_client = useContext(DANGEROUS_ClientContext);

  const config = useConfig();
  const chainId = internal_useChainId({
    ...options,
    optionalChainId: optionalChainId || dangerous_client !== undefined,
  });

  return useAtomValue(
    dangerous_client !== undefined
      ? atom(dangerous_client)
      : chainId === undefined
        ? atom(undefined)
        : clientAtom({
            config,
            chainId,
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
