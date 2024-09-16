import {
  getQueryInstructionPayloadAtoms,
  queryPayloadAtomFamily,
} from "../stores/query.js";
import type { Falsy, FalsyGuard, FlatHead } from "../types.js";
import { flatHead, stringify } from "../utils/vanilla.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import {
  idle,
  Query,
  type ChainId,
  type Chains,
  type CommonDescriptor,
} from "@reactive-dot/core";
import type {
  InferQueryPayload,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useMemo } from "react";

/**
 * Hook for refreshing cached query.
 *
 * @param builder - The function to create the query
 * @param options - Additional options
 * @returns The function to refresh the query
 */
export function useQueryRefresher<
  TQuery extends
    | ((
        builder: Query<[], TDescriptor>,
      ) => Query<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy,
  TDescriptor extends TChainId extends void
    ? CommonDescriptor
    : Chains[TChainId],
  TChainId extends ChainId,
>(builder: TQuery, options?: ChainHookOptions<TChainId>) {
  const config = useConfig();
  const chainId = internal_useChainId(options);

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

        const atoms = getQueryInstructionPayloadAtoms(
          config,
          chainId,
          query,
        ).flat();

        for (const atom of atoms) {
          if ("write" in atom) {
            set(atom);
          }
        }
      },
      [builder, chainId, config],
    ),
  );

  return refresh;
}

/**
 * Hook for querying data from chain, returning the response & a refresher function.
 *
 * @param builder - The function to create the query
 * @param options - Additional options
 * @returns The data response & a function to refresh it
 */
export function useLazyLoadQueryWithRefresh<
  TQuery extends
    | ((
        builder: Query<[], TDescriptor>,
      ) => Query<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy,
  TDescriptor extends TChainId extends void
    ? CommonDescriptor
    : Chains[TChainId],
  TChainId extends ChainId,
>(
  builder: TQuery,
  options?: ChainHookOptions<TChainId>,
): [
  data: TQuery extends Falsy
    ? typeof idle
    : FalsyGuard<
        ReturnType<Exclude<TQuery, Falsy>>,
        FlatHead<
          InferQueryPayload<Exclude<ReturnType<Exclude<TQuery, Falsy>>, Falsy>>
        >,
        typeof idle
      >,
  refresh: () => void,
] {
  const config = useConfig();
  const chainId = internal_useChainId(options);

  const query = useMemo(
    () => (!builder ? undefined : builder(new Query([]))),
    [builder],
  );

  const hashKey = useMemo(
    () => (!query ? query : stringify(query.instructions)),
    [query],
  );

  const rawData = useAtomValue(
    useMemo(
      () =>
        !query
          ? atom(idle)
          : queryPayloadAtomFamily({
              config,
              chainId,
              query,
            }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [hashKey],
    ),
  );

  const data = useMemo(
    () =>
      query && query.instructions.length === 1 ? flatHead(rawData) : rawData,
    [query, rawData],
  );

  const refresh = useQueryRefresher(builder, options);

  return [
    // @ts-expect-error complex type
    data,
    refresh,
  ];
}

/**
 * Hook for querying data from chain, and returning the response.
 *
 * @param builder - The function to create the query
 * @param options - Additional options
 * @returns The data response
 */
export function useLazyLoadQuery<
  TQuery extends
    | ((
        builder: Query<[], TDescriptor>,
      ) => Query<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy,
  TDescriptor extends TChainId extends void
    ? CommonDescriptor
    : Chains[TChainId],
  TChainId extends ChainId,
>(
  builder: TQuery,
  options?: ChainHookOptions<TChainId>,
): TQuery extends Falsy
  ? typeof idle
  : FalsyGuard<
      ReturnType<Exclude<TQuery, Falsy>>,
      FlatHead<
        InferQueryPayload<Exclude<ReturnType<Exclude<TQuery, Falsy>>, Falsy>>
      >,
      typeof idle
    > {
  const [data] = useLazyLoadQueryWithRefresh(builder, options);

  return data;
}
