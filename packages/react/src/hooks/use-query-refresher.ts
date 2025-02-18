import type { ChainHookOptions, QueryArgument } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { getQueryInstructionPayloadAtoms } from "./use-query.js";
import { Query, type ChainId } from "@reactive-dot/core";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for refreshing cached query.
 *
 * @param query - The function to create the query
 * @param options - Additional options
 * @returns The function to refresh the query
 */
export function useQueryRefresher<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
>(query: TQuery, options?: ChainHookOptions<TChainId>) {
  const config = useConfig();
  const chainId = internal_useChainId(options);

  const refresh = useAtomCallback(
    useCallback(
      (_, set) => {
        if (!query) {
          return;
        }

        const queryValue = query instanceof Query ? query : query(new Query());

        if (!queryValue) {
          return;
        }

        const atoms = getQueryInstructionPayloadAtoms(
          config,
          chainId,
          queryValue,
        ).flat();

        for (const atom of atoms) {
          if ("write" in atom) {
            set(atom);
          }
        }
      },
      [query, chainId, config],
    ),
  );

  return refresh;
}
