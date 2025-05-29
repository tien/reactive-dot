import type {
  ChainComposableOptions,
  InferQueryArgumentResult,
  QueryArgument,
} from "../types.js";
import {
  refresh,
  type Refreshable,
  refreshable,
} from "../utils/refreshable.js";
import { useAsyncData } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { getInkClient } from "./use-ink-client.js";
import { lazyValue, useLazyValuesCache } from "./use-lazy-value.js";
import { useTypedApiPromise } from "./use-typed-api.js";
import { type ChainId, Query } from "@reactive-dot/core";
import {
  type Contract,
  flatHead,
  type InkQueryInstruction,
  type SimpleInkQueryInstruction,
  type SimpleQueryInstruction,
  stringify,
} from "@reactive-dot/core/internal.js";
import {
  query as executeQuery,
  preflight,
  queryInk,
} from "@reactive-dot/core/internal/actions.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import { combineLatest, from, isObservable, type Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import {
  computed,
  type ComputedRef,
  type MaybeRefOrGetter,
  type ShallowRef,
  toValue,
  unref,
} from "vue";

/**
 * Composable for querying data from chain, and returning the response.
 *
 * @param query - The function to create the query
 * @param options - Additional options
 * @returns The data response
 */
export function useQuery<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
>(query: TQuery, options?: ChainComposableOptions<TChainId>) {
  return useAsyncData(useQueryObservable(query, options));
}

/**
 * @internal
 */
export function useQueryObservable<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
>(query: TQuery, options?: ChainComposableOptions<TChainId>) {
  const chainId = internal_useChainId(options);
  const typedApiPromise = useTypedApiPromise(options);
  const cache = useLazyValuesCache();

  const responses = computed(() => {
    const unwrappedQuery = unref(query);

    const queryValue =
      typeof unwrappedQuery !== "function"
        ? unwrappedQuery
        : unwrappedQuery(new Query());

    if (!queryValue) {
      return;
    }

    return queryValue.instructions.map((instruction) => {
      if (instruction.instruction === "read-contract") {
        const contract = instruction.contract;

        const processInkInstructions = (
          address: string,
          instructions: readonly InkQueryInstruction[],
        ) =>
          flatHead(
            instructions.map((instruction) => {
              if (!("multi" in instruction)) {
                return queryInkInstruction(
                  chainId,
                  typedApiPromise,
                  contract,
                  address,
                  instruction,
                  cache,
                );
              }

              const { multi, ...rest } = instruction;

              switch (rest.instruction) {
                case "read-storage": {
                  const { keys, ..._rest } = rest;

                  return keys.map((key) =>
                    queryInkInstruction(
                      chainId,
                      typedApiPromise,
                      contract,
                      address,
                      { ..._rest, key },
                      cache,
                    ),
                  );
                }
                case "send-message": {
                  const { bodies, ..._rest } = rest;

                  return bodies.map((body) =>
                    queryInkInstruction(
                      chainId,
                      typedApiPromise,
                      contract,
                      address,
                      { ..._rest, body },
                      cache,
                    ),
                  );
                }
              }
            }),
          );

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
        return queryInstruction(instruction, chainId, typedApiPromise, cache);
      }

      return instruction.args.map((args) => {
        const { multi, ...rest } = instruction;
        return queryInstruction(
          { ...rest, args },
          chainId,
          typedApiPromise,
          cache,
        );
      });
    });
  });

  return refreshable(
    computed(() => {
      if (responses.value === undefined) {
        return;
      }

      const combineLatestNested = (
        array: ComputedRef<Promise<unknown> | Observable<unknown>>[],
      ): Observable<unknown> => {
        if (array.length === 0) {
          return of([]);
        }

        const observables = array.map((value) => {
          const nestedValue = toValue(value);

          if (isObservable(nestedValue)) {
            return nestedValue;
          }

          if (Array.isArray(nestedValue)) {
            return combineLatestNested(nestedValue);
          }

          return from(nestedValue) as Observable<unknown>;
        });

        return combineLatest(observables);
      };

      return combineLatestNested(
        responses.value as unknown as ComputedRef<
          Promise<unknown> | Observable<unknown>
        >[],
      ).pipe(map(flatHead));
    }),
    () => {
      const recursiveRefresh = (
        refreshables:
          | Refreshable<ComputedRef<Promise<unknown>>>
          | Refreshable<ComputedRef<Promise<unknown>>>[],
      ) => {
        if (!Array.isArray(refreshables)) {
          refresh(refreshables);
        } else {
          for (const refreshable of refreshables) {
            recursiveRefresh(refreshable);
          }
        }
      };

      if (!responses.value) {
        return;
      }

      if (!Array.isArray(responses.value)) {
        return void refresh(responses.value);
      }

      recursiveRefresh(
        responses.value as unknown as Refreshable<
          ComputedRef<Promise<unknown>>
        >[],
      );
    },
  ) as Refreshable<
    ComputedRef<Observable<InferQueryArgumentResult<TChainId, TQuery>>>
  >;
}

function queryInstruction(
  instruction: SimpleQueryInstruction,
  chainId: MaybeRefOrGetter<ChainId>,
  typedApiPromise: MaybeRefOrGetter<Promise<TypedApi<ChainDefinition>>>,
  cache: MaybeRefOrGetter<Map<string, ShallowRef<unknown>>>,
) {
  return lazyValue(
    computed(() => [
      "query",
      toValue(chainId),
      stringify(toValue(instruction)),
    ]),
    () => {
      switch (preflight(toValue(instruction))) {
        case "promise":
          return toValue(typedApiPromise).then(
            (typedApi) =>
              executeQuery(typedApi, toValue(instruction)) as Promise<unknown>,
          );
        case "observable":
          return from(toValue(typedApiPromise)).pipe(
            switchMap(
              (typedApi) =>
                executeQuery(
                  typedApi,
                  toValue(instruction),
                ) as Observable<unknown>,
            ),
          );
      }
    },
    cache,
  );
}

function queryInkInstruction(
  chainId: MaybeRefOrGetter<ChainId>,
  typedApiPromise: MaybeRefOrGetter<Promise<TypedApi<ChainDefinition>>>,
  contract: Contract,
  address: MaybeRefOrGetter<string>,
  instruction: SimpleInkQueryInstruction,
  cache: MaybeRefOrGetter<Map<string, ShallowRef<unknown>>>,
) {
  const inkClient = getInkClient(contract, cache);

  return lazyValue(
    computed(() => [
      "ink-query",
      toValue(chainId),
      contract.valueOf(),
      stringify(instruction),
    ]),
    async () =>
      queryInk(
        await toValue(typedApiPromise),
        await toValue(inkClient),
        toValue(address),
        instruction,
      ),
    cache,
  );
}
