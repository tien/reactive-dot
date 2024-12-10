import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { useQueryRefresher } from "./use-query-refresher.js";
import { useTypedApi } from "./use-typed-api.js";
import {
  type ChainId,
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
import type { ChainDefinition, TypedApi } from "polkadot-api";
import { version as reactVersion, useMemo } from "react";
import { type Observable } from "rxjs";

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
  const typedApi = useTypedApi(options);

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
              api: typedApi,
              query,
            }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [hashKey],
    ),
    // TODO: remove once https://github.com/pmndrs/jotai/issues/2847 is fixed
    reactVersion.startsWith("19.") ? { delay: 0 } : undefined,
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
 * TODO: should be memoized within render function instead
 * https://github.com/pmndrs/jotai/discussions/1553
 */
export const queryPayloadAtom = atomFamilyWithErrorCatcher(
  (
    param: { api: TypedApi<ChainDefinition>; query: Query },
    withErrorCatcher,
  ): Atom<unknown> =>
    withErrorCatcher(atom)((get) => {
      const atoms = getQueryInstructionPayloadAtoms(param.api, param.query);

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
    a.api === b.api &&
    stringify(a.query.instructions) === stringify(b.query.instructions),
);

/**
 * @internal
 */
export function getQueryInstructionPayloadAtoms(
  api: TypedApi<ChainDefinition>,
  query: Query,
) {
  return query.instructions.map((instruction) => {
    if (!("multi" in instruction)) {
      return instructionPayloadAtom({
        api,
        instruction,
      });
    }

    return (instruction.args as unknown[]).map((args) => {
      const { multi, ...rest } = instruction;

      return instructionPayloadAtom({
        api,
        instruction: { ...rest, args },
      });
    });
  });
}

/**
 * @internal
 */
export const instructionPayloadAtom = atomFamilyWithErrorCatcher(
  (
    param: {
      api: TypedApi<ChainDefinition>;
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
        return withErrorCatcher(atomWithRefresh)(async (_, { signal }) =>
          query(param.api, param.instruction, { signal }),
        );
      case "observable":
        return withErrorCatcher(atomWithObservable)(
          () => query(param.api, param.instruction) as Observable<unknown>,
        );
    }
  },
  (a, b) =>
    a.api === b.api && stringify(a.instruction) === stringify(b.instruction),
);
