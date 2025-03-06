import { findAllIndexes } from "../utils/find-all-indexes.js";
import { interlace } from "../utils/interlace.js";
import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import { atomWithObservableAndPromise } from "../utils/jotai/atom-with-observable-and-promise.js";
import { maybePromiseAll } from "../utils/maybe-promise-all.js";
import { objectId } from "../utils/object-id.js";
import type {
  ChainHookOptions,
  InferQueryArgumentResult,
  QueryArgument,
  QueryOptions,
} from "./types.js";
import { useConfig } from "./use-config.js";
import { usePausableAtomValue } from "./use-pausable-atom-value.js";
import { useQueryOptions } from "./use-query-options.js";
import { useQueryRefresher } from "./use-query-refresher.js";
import { typedApiAtom } from "./use-typed-api.js";
import {
  type ChainId,
  type Config,
  idle,
  type Query,
} from "@reactive-dot/core";
import {
  flatHead,
  type MultiInstruction,
  type QueryInstruction,
  stringify,
} from "@reactive-dot/core/internal.js";
import { preflight, query } from "@reactive-dot/core/internal/actions.js";
import { atom } from "jotai";
import { soon } from "jotai-derive";
import { atomWithRefresh } from "jotai/utils";
import { useMemo } from "react";
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
>(
  query: TQuery,
  options?: ChainHookOptions<TChainId>,
): InferQueryArgumentResult<TChainId, TQuery>;
/**
 * Hook for querying data from chain, and returning the response.
 *
 * @param options - The query options
 * @returns The data response
 */
export function useLazyLoadQuery<
  TChainIds extends Array<ChainId | undefined>,
  const TOptions extends {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
>(
  options: TOptions & {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
): {
  [P in keyof TOptions]: InferQueryArgumentResult<
    TOptions[P]["chainId"],
    TOptions[P]["query"]
  >;
};
export function useLazyLoadQuery(
  queryOrOptions: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | QueryArgument<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | Array<ChainHookOptions<any> & { query: QueryArgument<any> }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mayBeOptions?: ChainHookOptions<any>,
) {
  const options = useQueryOptions(
    // @ts-expect-error complex overload
    queryOrOptions,
    mayBeOptions,
  );

  const partialData = usePausableAtomValue(
    queryPayloadAtom(
      useConfig(),
      useMemo(
        () =>
          options.filter(
            (
              options,
            ): options is Omit<typeof options, "query"> & {
              query: NonNullable<(typeof options)["query"]>;
            } => options.query !== undefined,
          ),
        [options],
      ),
    ),
  );

  return useMemo<unknown>(() => {
    const unflattenedData = interlace(
      partialData,
      findAllIndexes(options, (options) => options.query === undefined).map(
        (index) => [idle as unknown, index] as const,
      ),
    );

    return !Array.isArray(queryOrOptions)
      ? flatHead(unflattenedData)
      : unflattenedData;
  }, [options, partialData, queryOrOptions]);
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
>(
  query: TQuery,
  options?: ChainHookOptions<TChainId>,
): [data: InferQueryArgumentResult<TChainId, TQuery>, refresh: () => void];
/**
 * Hook for querying data from chain, returning the response & a refresher function.
 *
 * @param query - The function to create the query
 * @param options - Additional options
 * @returns The data response & a function to refresh it
 */
export function useLazyLoadQueryWithRefresh<
  TChainIds extends Array<ChainId | undefined>,
  const TOptions extends {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
>(
  options: TOptions & {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
): [
  data: {
    [P in keyof TOptions]: InferQueryArgumentResult<
      TOptions[P]["chainId"],
      TOptions[P]["query"]
    >;
  },
  refresh: () => void,
];
/**
 * Hook for querying data from chain, returning the response & a refresher function.
 *
 * @param query - The function to create the query
 * @param options - Additional options
 * @returns The data response & a function to refresh it
 */
export function useLazyLoadQueryWithRefresh(
  ...args: unknown[]
): [unknown, unknown] {
  // @ts-expect-error need to spread args
  const data = useLazyLoadQuery(...args);
  // @ts-expect-error need to spread args
  const refresh = useQueryRefresher(...args);

  return [data, refresh];
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
  ) => {
    switch (preflight(instruction)) {
      case "promise": {
        const atom = withErrorCatcher(
          atomWithRefresh((get, { signal }) =>
            soon(get(typedApiAtom(config, chainId)), (api) =>
              query(api, instruction, { signal }),
            ),
          ),
        );

        return {
          observableAtom: atom,
          promiseAtom: atom,
        };
      }
      case "observable":
        return atomWithObservableAndPromise(
          (get) =>
            from(Promise.resolve(get(typedApiAtom(config, chainId)))).pipe(
              switchMap(
                (api) => query(api, instruction) as Observable<unknown>,
              ),
            ),
          withErrorCatcher,
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
    params: Array<{ chainId: ChainId; query: Query }>,
  ) => {
    const atoms = params.map((param) =>
      getQueryInstructionPayloadAtoms(config, param.chainId, param.query),
    );

    const unwrap = (
      atoms: ReturnType<typeof atomWithObservableAndPromise>,
      asObservable: boolean,
    ) => (asObservable ? atoms.observableAtom : atoms.promiseAtom);

    const createAtom = (asObservable: boolean) =>
      withErrorCatcher(
        atom((get) => {
          return maybePromiseAll(
            atoms.map((atomOrAtoms) =>
              !Array.isArray(atomOrAtoms)
                ? atomOrAtoms
                : soon(
                    maybePromiseAll(
                      atomOrAtoms.map((atomOrAtoms) => {
                        if (Array.isArray(atomOrAtoms)) {
                          return maybePromiseAll(
                            atomOrAtoms.map((atom) =>
                              get(unwrap(atom, asObservable)),
                            ),
                          );
                        }

                        return get(unwrap(atomOrAtoms, asObservable));
                      }),
                    ),
                    flatHead,
                  ),
            ),
          );
        }),
      );

    return { promiseAtom: createAtom(false), observableAtom: createAtom(true) };
  },
  (config, params) =>
    [
      objectId(config),
      ...params.map((param) => [
        param.chainId,
        stringify(param.query.instructions),
      ]),
    ].join(),
);
