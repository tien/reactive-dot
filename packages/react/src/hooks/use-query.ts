import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { useQueryRefresher } from "./use-query-refresher.js";
import { typedApiAtom } from "./use-typed-api.js";
import {
  type ChainId,
  type Config,
  idle,
  preflight,
  query,
  Query,
} from "@reactive-dot/core";
import {
  type ChainDescriptorOf,
  type Falsy,
  type FalsyGuard,
  flatHead,
  type FlatHead,
  type InferQueryPayload,
  type MultiInstruction,
  type QueryInstruction,
  stringify,
} from "@reactive-dot/core/internal.js";
import { type Atom, atom, useAtomValue, type WritableAtom } from "jotai";
import { atomWithObservable, atomWithRefresh } from "jotai/utils";
import { useMemo } from "react";
import { from, type Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

/**
 * Hook for querying data from chain, and returning the response.
 *
 * @param builder - The function to create the query
 * @param options - Additional options
 * @returns The data response
 */
export function useLazyLoadQuery<
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
        builder: Query<[], ChainDescriptorOf<TChainId>>,
      ) =>
        | Query<
            QueryInstruction<ChainDescriptorOf<TChainId>>[],
            ChainDescriptorOf<TChainId>
          >
        | Falsy)
    | Falsy,
  TChainId extends ChainId | undefined,
>(builder: TQuery, options?: ChainHookOptions<TChainId>) {
  const data = useLazyLoadQuery(builder, options);
  const refresh = useQueryRefresher(builder, options);

  return [data, refresh] as [data: typeof data, refresh: typeof refresh];
}

/**
 * @internal
 */
export const instructionPayloadAtom = atomFamilyWithErrorCatcher(
  (
    param: {
      config: Config;
      chainId: ChainId;
      instruction: Exclude<
        QueryInstruction,
        MultiInstruction<// @ts-expect-error need any empty object here
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        {}>
      >;
    },
    withErrorCatcher,
  ): Atom<unknown> | WritableAtom<Promise<unknown>, [], void> => {
    switch (preflight(param.instruction)) {
      case "promise":
        return withErrorCatcher(atomWithRefresh)(async (get, { signal }) => {
          const api = await get(typedApiAtom(param));

          return query(api, param.instruction, { signal });
        });
      case "observable":
        return withErrorCatcher(atomWithObservable)((get) =>
          from(get(typedApiAtom(param))).pipe(
            switchMap(
              (api) => query(api, param.instruction) as Observable<unknown>,
            ),
          ),
        );
    }
  },
  (a, b) =>
    a.config === b.config &&
    a.chainId === b.chainId &&
    stringify(a.instruction) === stringify(b.instruction),
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
      return instructionPayloadAtom({
        config,
        chainId,
        instruction,
      });
    }

    return (instruction.args as unknown[]).map((args) => {
      const { multi, ...rest } = instruction;

      return instructionPayloadAtom({
        config,
        chainId,
        instruction: { ...rest, args },
      });
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
    param: { config: Config; chainId: ChainId; query: Query },
    withErrorCatcher,
  ): Atom<unknown> =>
    withErrorCatcher(atom)((get) => {
      const atoms = getQueryInstructionPayloadAtoms(
        param.config,
        param.chainId,
        param.query,
      );

      return Promise.all(
        atoms.map((atomOrAtoms) => {
          if (Array.isArray(atomOrAtoms)) {
            return Promise.all(atomOrAtoms.map(get));
          }

          return get(atomOrAtoms);
        }),
      );
    }),
  (a, b) =>
    a.config === b.config &&
    a.chainId === b.chainId &&
    stringify(a.query.instructions) === stringify(b.query.instructions),
);
