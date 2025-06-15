import { findAllIndexes } from "../utils/find-all-indexes.js";
import { interlace } from "../utils/interlace.js";
import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import { atomWithObservableAndPromise } from "../utils/jotai/atom-with-observable-and-promise.js";
import { atomWithPromise } from "../utils/jotai/atom-with-promise.js";
import { maybePromiseAll } from "../utils/maybe-promise-all.js";
import { objectId } from "../utils/object-id.js";
import type {
  ChainHookOptions,
  InferQueryArgumentResult,
  QueryArgument,
  QueryOptions,
} from "./types.js";
import { useConfig } from "./use-config.js";
import { inkClientAtom } from "./use-ink-client.js";
import { usePausableAtomValue } from "./use-pausable-atom-value.js";
import { useQueryOptions } from "./use-query-options.js";
import { useQueryRefresher } from "./use-query-refresher.js";
import { useRenderEffect } from "./use-render-effect.js";
import { typedApiAtom } from "./use-typed-api.js";
import {
  type ChainId,
  type Config,
  idle,
  type Query,
} from "@reactive-dot/core";
import {
  type Contract,
  flatHead,
  type InkQueryInstruction,
  type SimpleInkQueryInstruction,
  type SimpleQueryInstruction,
  stringify,
} from "@reactive-dot/core/internal.js";
import {
  preflight,
  query,
  queryInk,
} from "@reactive-dot/core/internal/actions.js";
import { atom, type Getter } from "jotai";
import { soon, soonAll } from "jotai-derive";
import { useMemo } from "react";
import { from, type Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

type FetchOptions = {
  /**
   * A unique identifier that, when changed, forces a refresh of the current query.
   */
  fetchKey?: string | number;
};

/**
 * Hook for querying data from chain, and returning the response.
 *
 * @group Hooks
 * @param query - The function to create the query
 * @param options - Additional options
 * @returns The data response
 */
export function useLazyLoadQuery<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
>(
  query: TQuery,
  options?: ChainHookOptions<TChainId> & FetchOptions,
): InferQueryArgumentResult<TChainId, TQuery>;
/**
 * Hook for querying data from chain, and returning the response.
 *
 * @group Hooks
 * @param options - The query options
 * @returns The data response
 */
export function useLazyLoadQuery<
  TChainIds extends Array<ChainId | undefined>,
  const TOptions extends {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
>(
  queryOptions: TOptions & {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
  options?: FetchOptions,
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
  mayBeOptions?: ChainHookOptions<any> | FetchOptions,
) {
  const options = useQueryOptions(
    // @ts-expect-error complex overload
    queryOrOptions,
    mayBeOptions,
  );

  // @ts-expect-error complex types
  const refresh = useQueryRefresher(queryOrOptions, mayBeOptions);

  const fetchKey =
    mayBeOptions !== undefined && "fetchKey" in mayBeOptions
      ? mayBeOptions.fetchKey
      : undefined;

  useRenderEffect(() => {
    refresh();
  }, fetchKey);

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
 * @deprecated Use {@link useLazyLoadQuery} with {@link FetchOptions.fetchKey | options.fetchKey} instead
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
 * @deprecated Use {@link useLazyLoadQuery} with {@link FetchOptions.fetchKey | options.fetchKey} instead
 * @group Hooks
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
export function useLazyLoadQueryWithRefresh(
  ...args: unknown[]
): [unknown, unknown] {
  // @ts-expect-error need to spread args
  const data = useLazyLoadQuery(...args);
  // @ts-expect-error need to spread args
  const refresh = useQueryRefresher(...args);

  return [data, refresh];
}

const inkInstructionPayloadAtom = atomFamilyWithErrorCatcher(
  (
    withErrorCatcher,
    config: Config,
    chainId: ChainId,
    contract: Contract,
    address: string,
    instruction: SimpleInkQueryInstruction,
  ) => {
    const promiseAtom = withErrorCatcher(
      atomWithPromise((get, { signal }) =>
        soon(
          soonAll([
            get(typedApiAtom(config, chainId)),
            get(inkClientAtom(contract)),
          ]),
          ([api, inkClient]) =>
            queryInk(api, inkClient, address, instruction, { signal }),
        ),
      ),
    );

    return { promiseAtom, observableAtom: promiseAtom };
  },
  (config, chainId, contract, address, instruction) =>
    [
      objectId(config),
      chainId,
      contract.valueOf(),
      address,
      stringify(instruction),
    ].join(),
);

const instructionPayloadAtom = atomFamilyWithErrorCatcher(
  (
    withErrorCatcher,
    config: Config,
    chainId: ChainId,
    instruction: SimpleQueryInstruction,
  ) => {
    switch (preflight(instruction)) {
      case "promise": {
        const atom = withErrorCatcher(
          atomWithPromise((get, { signal }) =>
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
    if (instruction.instruction === "read-contract") {
      const processInkInstructions = (
        address: string,
        instructions: InkQueryInstruction[],
      ) => {
        return flatHead(
          instructions.map((instruction) => {
            if (!("multi" in instruction)) {
              return inkInstructionPayloadAtom(
                config,
                chainId,
                contract,
                address,
                instruction,
              );
            }

            const { multi, ...rest } = instruction;

            switch (rest.instruction) {
              case "read-storage": {
                const { keys, ..._rest } = rest;

                return keys.map((key) =>
                  inkInstructionPayloadAtom(
                    config,
                    chainId,
                    contract,
                    address,
                    {
                      ..._rest,
                      key,
                    },
                  ),
                );
              }
              case "send-message": {
                const { bodies, ..._rest } = rest;

                return bodies.map((body) =>
                  inkInstructionPayloadAtom(
                    config,
                    chainId,
                    contract,
                    address,
                    {
                      ..._rest,
                      body,
                    },
                  ),
                );
              }
            }
          }),
        );
      };

      const { contract } = instruction;

      if (!("multi" in instruction)) {
        return processInkInstructions(
          instruction.address,
          instruction.instructions,
        );
      }

      const { addresses, ...rest } = instruction;
      return addresses.map((address) =>
        processInkInstructions(address, rest.instructions),
      );
    }

    if (!("multi" in instruction)) {
      return instructionPayloadAtom(config, chainId, instruction);
    }

    return instruction.args.map((args) => {
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

    return {
      promiseAtom: withErrorCatcher(
        atom((get) => soon(getNestedAtoms(get, atoms, false), flatHead)),
      ),
      observableAtom: withErrorCatcher(
        atom((get) => soon(getNestedAtoms(get, atoms, true), flatHead)),
      ),
    };
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

function unwrapObservableOrPromiseAtom(
  atoms: ReturnType<typeof atomWithObservableAndPromise>,
  asObservable: boolean,
) {
  return asObservable ? atoms.observableAtom : atoms.promiseAtom;
}

type UnwrapObservableOrPromiseAtoms<T extends unknown[]> = {
  [P in keyof T]: T[P] extends ReturnType<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof atomWithObservableAndPromise<infer Value, any>
  >
    ? Value
    : T[P] extends unknown[]
      ? UnwrapObservableOrPromiseAtoms<T[P]>
      : unknown;
};

function getNestedAtoms<T extends unknown[]>(
  get: Getter,
  nestedAtomArray: T,
  asObservable: boolean,
): UnwrapObservableOrPromiseAtoms<T> {
  return maybePromiseAll(
    nestedAtomArray.map((_atom) => {
      const atom = _atom as
        | ReturnType<typeof atomWithObservableAndPromise>
        | Array<ReturnType<typeof atomWithObservableAndPromise>>;

      if (!Array.isArray(atom)) {
        return get(unwrapObservableOrPromiseAtom(atom, asObservable));
      }

      return getNestedAtoms(get, atom, asObservable);
    }),
  ) as UnwrapObservableOrPromiseAtoms<T>;
}
