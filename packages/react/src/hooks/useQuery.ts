import { ChainIdContext } from "../context.js";
import {
  getQueryInstructionPayloadAtoms,
  queryPayloadAtomFamily,
} from "../stores/query.js";
import type { Falsy, FalsyGuard, FlatHead } from "../types.js";
import { flatHead, stringify } from "../utils.js";
import type { ChainHookOptions } from "./types.js";
import {
  Query,
  QueryError,
  QueryInstruction,
  type InferQueryPayload,
} from "@reactive-dot/core";
import type { ChainId, Chains, ReDotDescriptor } from "@reactive-dot/types";
import { atom, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useContext, useMemo } from "react";

/**
 * Hook for querying data from chain, returning the response & a refresher function.
 *
 * @param builder - The function to create the query
 * @param options - Additional options
 * @returns The data response & a function to refresh it
 */
export const useQueryWithRefresh = <
  TQuery extends
    | ((
        builder: Query<[], TDescriptor>,
      ) => Query<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy,
  TDescriptor extends TChainId extends void
    ? ReDotDescriptor
    : Chains[Exclude<TChainId, void>],
  TChainId extends ChainId | void = void,
>(
  builder: TQuery,
  options?: ChainHookOptions,
): [
  data: TQuery extends false
    ? undefined
    : FalsyGuard<
        ReturnType<Exclude<TQuery, Falsy>>,
        FlatHead<
          InferQueryPayload<Exclude<ReturnType<Exclude<TQuery, Falsy>>, Falsy>>
        >
      >,
  refresh: () => void,
] => {
  const contextChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (chainId === undefined) {
    throw new QueryError("No chain ID provided");
  }

  const query = useMemo(
    () => (!builder ? undefined : builder(new Query([]))),
    [builder],
  );

  const hashKey = useMemo(
    () => (!query ? query : stringify(query.instructions)),
    [query],
  );

  const data = flatHead(
    useAtomValue(
      useMemo(
        () =>
          !query
            ? atom(undefined)
            : queryPayloadAtomFamily({
                chainId,
                query,
              }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [hashKey],
      ),
    ),
  );

  const refresh = useAtomCallback(
    useCallback(
      (_, set) => {
        if (!query) {
          return;
        }

        const atoms = getQueryInstructionPayloadAtoms(chainId, query).flat();

        for (const atom of atoms) {
          if ("write" in atom) {
            set(atom);
          }
        }
      },
      [chainId, query],
    ),
  );

  return [
    // @ts-expect-error complex type
    data,
    refresh,
  ];
};

/**
 * Hook for querying data from chain, and returning the response.
 *
 * @param builder - The function to create the query
 * @param options - Additional options
 * @returns The data response
 */
export const useQuery = <
  TQuery extends
    | ((
        builder: Query<[], TDescriptor>,
      ) => Query<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy,
  TDescriptor extends TChainId extends void
    ? ReDotDescriptor
    : Chains[Exclude<TChainId, void>],
  TChainId extends ChainId | void = void,
>(
  builder: TQuery,
  options?: ChainHookOptions,
): TQuery extends false
  ? undefined
  : FalsyGuard<
      ReturnType<Exclude<TQuery, Falsy>>,
      FlatHead<
        InferQueryPayload<Exclude<ReturnType<Exclude<TQuery, Falsy>>, Falsy>>
      >
    > => {
  const [data] = useQueryWithRefresh(builder, options);

  return data;
};
