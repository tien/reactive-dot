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
import { lazyValue, useLazyValuesCache } from "./use-lazy-value.js";
import { useTypedApiPromise } from "./use-typed-api.js";
import { type ChainId, Query } from "@reactive-dot/core";
import {
  type FlatHead,
  flatHead,
  type MultiInstruction,
  type QueryInstruction,
  stringify,
} from "@reactive-dot/core/internal.js";
import {
  query as executeQuery,
  preflight,
} from "@reactive-dot/core/internal/actions.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import { combineLatest, from, type Observable, of } from "rxjs";
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

    if (queryValue.instructions.length === 1) {
      return [
        queryInstruction(
          queryValue.instructions.at(0)!,
          chainId,
          typedApiPromise,
          cache,
        ),
      ];
    }

    return queryValue.instructions.map((instruction) => {
      if (!("multi" in instruction)) {
        return queryInstruction(instruction, chainId, typedApiPromise, cache);
      }

      return (instruction.args as unknown[]).map((args) => {
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

      return combineLatest(
        responses.value.map((response) => {
          if (!Array.isArray(response)) {
            return from(response.value);
          }

          const responses = response.map((response) => response.value);

          if (responses.length === 0) {
            return of([]);
          }

          return combineLatest(response.map((response) => response.value));
        }),
      ).pipe(map(flatHead));
    }),
    () => {
      if (!responses.value) {
        return;
      }

      if (!Array.isArray(responses.value)) {
        return void refresh(responses.value);
      }

      for (const response of responses.value) {
        if (!Array.isArray(response)) {
          refresh(response);
        } else {
          for (const subResponse of response) {
            refresh(subResponse);
          }
        }
      }
    },
  ) as Refreshable<
    ComputedRef<
      Observable<FlatHead<InferQueryArgumentResult<TChainId, TQuery>>>
    >
  >;
}

function queryInstruction(
  instruction: MaybeRefOrGetter<
    Exclude<
      QueryInstruction,
      MultiInstruction<// @ts-expect-error need any empty object here
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {}>
    >
  >,
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
