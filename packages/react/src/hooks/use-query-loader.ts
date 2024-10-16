import { queryPayloadAtom } from "../stores/query.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import {
  type ChainId,
  type Chains,
  type CommonDescriptor,
  Query,
} from "@reactive-dot/core";
import type { QueryInstruction } from "@reactive-dot/core/internal.js";
import type { Getter } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for loading queries without suspending.
 *
 * @returns The function to load queries
 */
export function useQueryLoader() {
  const config = useConfig();
  const chainId = internal_useChainId();

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
          queryPayloadAtom({
            config,
            chainId: options?.chainId ?? chainId,
            query,
          }),
        );
      },
    [chainId, config],
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
