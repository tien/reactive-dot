import {
  instructionPayloadAtomFamily,
  queryPayloadAtomFamily,
} from "../stores/query.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import {
  Query,
  type ChainId,
  type Chains,
  type CommonDescriptor,
  type QueryInstruction,
} from "@reactive-dot/core";
import type { Getter } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for disposing loaded queries
 * @experimental
 *
 * @returns The function to dispose queries
 */
export function useQueryDisposer() {
  const chainId = internal_useChainId();

  const _disposeQuery = useCallback(
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

  const disposeQuery = useAtomCallback(
    useCallback(
      (
        get,
        _,
        builder: <TChainId extends ChainId>(
          query: Query<[]>,
          options?: ChainHookOptions<TChainId>,
        ) => Query<[]>,
      ) => _disposeQuery(get)(builder),
      [_disposeQuery],
    ),
  ) as ReturnType<typeof _disposeQuery>;

  return Object.assign(disposeQuery, {
    /**
     * @experimental
     */
    allMatching(
      shouldDispose: (
        param: ReturnType<
          (typeof instructionPayloadAtomFamily)["getParams"]
        > extends Iterable<infer Param>
          ? Param
          : never,
      ) => boolean,
    ) {
      for (const param of instructionPayloadAtomFamily.getParams()) {
        if (shouldDispose(param)) {
          instructionPayloadAtomFamily.remove(param);
        }
      }
    },
    /**
     * @experimental
     */
    all() {
      this.allMatching(() => true);
    },
  });
}
