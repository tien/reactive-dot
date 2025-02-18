import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import { objectId } from "../utils/object-id.js";
import type {
  ChainHookOptions,
  InferQueryArgumentResult,
  QueryArgument,
} from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { useQueryRefresher } from "./use-query-refresher.js";
import { typedApiAtom } from "./use-typed-api.js";
import { type ChainId, type Config, idle, Query } from "@reactive-dot/core";
import {
  flatHead,
  type MultiInstruction,
  type QueryInstruction,
  stringify,
} from "@reactive-dot/core/internal.js";
import { preflight, query } from "@reactive-dot/core/internal/actions.js";
import { type Atom, atom, useAtomValue, type WritableAtom } from "jotai";
import { atomWithObservable, atomWithRefresh } from "jotai/utils";
import { version as reactVersion, useMemo } from "react";
import { from, type Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

/**
 * Hook for querying data from chain, and returning the response.
 *
 * @param query - The function to create the query
 * @param options - Additional options
 * @returns The data response
 */
export function useLazyLoadQuery<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
>(query: TQuery, options?: ChainHookOptions<TChainId>) {
  const config = useConfig();
  const chainId = internal_useChainId(options);

  const queryValue = useMemo(
    () =>
      !query ? undefined : query instanceof Query ? query : query(new Query()),
    [query],
  );

  const hashKey = useMemo(
    () => (!queryValue ? queryValue : stringify(queryValue.instructions)),
    [queryValue],
  );

  const rawData = useAtomValue(
    useMemo(
      () =>
        !queryValue
          ? atom(idle)
          : queryPayloadAtom(config, chainId, queryValue),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [hashKey],
    ),
    // TODO: remove once https://github.com/pmndrs/jotai/issues/2847 is fixed
    reactVersion.startsWith("19.") ? { delay: 0 } : undefined,
  );

  return useMemo(
    () =>
      queryValue && queryValue.instructions.length === 1
        ? flatHead(rawData)
        : rawData,
    [queryValue, rawData],
  ) as InferQueryArgumentResult<TChainId, TQuery>;
}

/**
 * Hook for querying data from chain, returning the response & a refresher function.
 *
 * @param query - The function to create the query
 * @param options - Additional options
 * @returns The data response & a function to refresh it
 */
export function useLazyLoadQueryWithRefresh<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
>(query: TQuery, options?: ChainHookOptions<TChainId>) {
  const data = useLazyLoadQuery(query, options);
  const refresh = useQueryRefresher(query, options);

  return [data, refresh] as [data: typeof data, refresh: typeof refresh];
}

const instructionPayloadAtom = atomFamilyWithErrorCatcher(
  (
    withErrorCatcher,
    config: Config,
    chainId: ChainId,
    instruction: Exclude<
      QueryInstruction,
      MultiInstruction<// @ts-expect-error need any empty object here
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {}>
    >,
  ): Atom<unknown> | WritableAtom<Promise<unknown>, [], void> => {
    switch (preflight(instruction)) {
      case "promise":
        return withErrorCatcher(atomWithRefresh)(async (get, { signal }) => {
          const api = await get(typedApiAtom(config, chainId));

          return query(api, instruction, { signal });
        });
      case "observable":
        return withErrorCatcher(atomWithObservable)((get) =>
          from(get(typedApiAtom(config, chainId))).pipe(
            switchMap((api) => query(api, instruction) as Observable<unknown>),
          ),
        );
    }
  },
  (config, chainId, instruction) =>
    [objectId(config), chainId, stringify(instruction)].join(),
);

/**
 * @internal
 */
export function getQueryInstructionPayloadAtoms(
  config: Config,
  chainId: ChainId,
  query: Query,
) {
  return query.instructions.map((instruction) => {
    if (!("multi" in instruction)) {
      return instructionPayloadAtom(config, chainId, instruction);
    }

    return (instruction.args as unknown[]).map((args) => {
      const { multi, ...rest } = instruction;

      return instructionPayloadAtom(config, chainId, { ...rest, args });
    });
  });
}

/**
 * @internal
 * TODO: should be memoized within render function instead
 * https://github.com/pmndrs/jotai/discussions/1553
 */
export const queryPayloadAtom = atomFamilyWithErrorCatcher(
  (
    withErrorCatcher,
    config: Config,
    chainId: ChainId,
    query: Query,
  ): Atom<unknown> => {
    const atoms = getQueryInstructionPayloadAtoms(config, chainId, query);

    return withErrorCatcher(atom)((get) => {
      return Promise.all(
        atoms.map((atomOrAtoms) => {
          if (Array.isArray(atomOrAtoms)) {
            return Promise.all(atomOrAtoms.map(get));
          }

          return get(atomOrAtoms);
        }),
      );
    });
  },
  (config, chainId, query) =>
    [objectId(config), chainId, stringify(query.instructions)].join(),
);
