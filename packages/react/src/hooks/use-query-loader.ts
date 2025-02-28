import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { queryPayloadAtom } from "./use-query.js";
import { type ChainId, Query } from "@reactive-dot/core";
import type {
  ChainDescriptorOf,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
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
        TChainId extends ChainId | undefined,
        TQuery extends (
          query: Query<[], ChainDescriptorOf<TChainId>>,
        ) => Query<
          QueryInstruction<ChainDescriptorOf<TChainId>>[],
          ChainDescriptorOf<TChainId>
        >,
      >(
        builder: TQuery,
        options?: ChainHookOptions<TChainId>,
      ) => {
        const query = builder(new Query());

        void get(
          queryPayloadAtom(config, [
            {
              query,
              chainId: options?.chainId ?? chainId,
            },
          ]).observableAtom,
        );
      },
    [chainId, config],
  );

  const loadQuery = useAtomCallback(
    useCallback(
      (
        get,
        _,
        builder: <TChainId extends ChainId | undefined>(
          query: Query<[], ChainDescriptorOf<TChainId>>,
          options?: ChainHookOptions<TChainId>,
        ) => Query<[]>,
      ) => _loadQuery(get)(builder),
      [_loadQuery],
    ),
  );

  return loadQuery as ReturnType<typeof _loadQuery>;
}
