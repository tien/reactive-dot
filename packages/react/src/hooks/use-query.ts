import { queryPayloadAtom } from "../stores/query.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { useQueryRefresher } from "./use-query-refresher.js";
import { idle, Query, type ChainId } from "@reactive-dot/core";
import {
  type ChainDescriptorOf,
  flatHead,
  stringify,
  type Falsy,
  type FalsyGuard,
  type FlatHead,
  type InferQueryPayload,
  type QueryInstruction,
} from "@reactive-dot/core/internal.js";
import { atom, useAtomValue } from "jotai";
import { useMemo } from "react";

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
  TDescriptor extends ChainDescriptorOf<TChainId>,
  TChainId extends ChainId,
>(builder: TQuery, options?: ChainHookOptions<TChainId>) {
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
          : queryPayloadAtom({
              config,
              chainId,
              query,
            }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [hashKey],
    ),
  );

  return useMemo(
    () =>
      query && query.instructions.length === 1 ? flatHead(rawData) : rawData,
    [query, rawData],
  ) as TQuery extends Falsy
    ? typeof idle
    : FalsyGuard<
        ReturnType<Exclude<TQuery, Falsy>>,
        FlatHead<
          InferQueryPayload<Exclude<ReturnType<Exclude<TQuery, Falsy>>, Falsy>>
        >,
        typeof idle
      >;
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
  TDescriptor extends ChainDescriptorOf<TChainId>,
  TChainId extends ChainId,
>(builder: TQuery, options?: ChainHookOptions<TChainId>) {
  const data = useLazyLoadQuery(builder, options);
  const refresh = useQueryRefresher(builder, options);

  return [data, refresh] as [data: typeof data, refresh: typeof refresh];
}
