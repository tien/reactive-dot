import { queryPayloadAtomFamily } from "../stores/query.js";
import type { ChainHookOptions } from "./types.js";
import { useChainId_INTERNAL } from "./use-chain-id.js";
import {
  type ChainId,
  type Chains,
  type CommonDescriptor,
  Query,
  type QueryInstruction,
} from "@reactive-dot/core";
import type { Getter } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for loading queries without suspending.
 *
 * @returns The function to load queries
 */
export function useQueryLoader() {
  const chainId = useChainId_INTERNAL();

  const _loadQuery = useCallback(
    (get: Getter) =>
      <
        TQuery extends (
          builder: Query<[], TDescriptor>,
        ) => Query<QueryInstruction<TDescriptor>[], TDescriptor>,
        TDescriptor extends TChainId extends void
          ? CommonDescriptor
          : Chains[TChainId],
        TChainId extends ChainId,
      >(
        builder: TQuery,
        options?: ChainHookOptions<TChainId>,
      ) => {
        const query = builder(new Query([]));

        void get(
          queryPayloadAtomFamily({
            chainId: options?.chainId ?? chainId,
            query,
          }),
        );
      },
    [chainId],
  );

  const loadQuery = useAtomCallback(
    useCallback(
      (
        get,
        _,
        builder: <TChainId extends ChainId>(
          query: Query<[]>,
          options?: ChainHookOptions<TChainId>,
        ) => Query<[]>,
      ) => _loadQuery(get)(builder),
      [_loadQuery],
    ),
  );

  return loadQuery as ReturnType<typeof _loadQuery>;
}
