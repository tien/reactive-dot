import type { ChainHookOptions } from "./types.js";
import { getQueryInstructionPayloadAtoms } from "./use-query.js";
import { useTypedApi } from "./use-typed-api.js";
import { Query, type ChainId } from "@reactive-dot/core";
import type {
  ChainDescriptorOf,
  Falsy,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for refreshing cached query.
 *
 * @param builder - The function to create the query
 * @param options - Additional options
 * @returns The function to refresh the query
 */
export function useQueryRefresher<
  TChainId extends ChainId | undefined,
  TQuery extends
    | ((
        builder: Query<[], ChainDescriptorOf<TChainId>>,
      ) =>
        | Query<
            QueryInstruction<ChainDescriptorOf<TChainId>>[],
            ChainDescriptorOf<TChainId>
          >
        | Falsy)
    | Falsy,
>(builder: TQuery, options?: ChainHookOptions<TChainId>) {
  const api = useTypedApi(options);

  const refresh = useAtomCallback(
    useCallback(
      (_, set) => {
        if (!builder) {
          return;
        }

        const query = builder(new Query([]));

        if (!query) {
          return;
        }

        const atoms = getQueryInstructionPayloadAtoms(api, query).flat();

        for (const atom of atoms) {
          if ("write" in atom) {
            set(atom);
          }
        }
      },
      [api, builder],
    ),
  );

  return refresh;
}
