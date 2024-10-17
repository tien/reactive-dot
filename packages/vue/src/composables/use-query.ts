import type { ChainComposableOptions, AsyncState } from "../types.js";
import { refresh, refreshable } from "../utils/refreshable.js";
import { useAsyncData } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { lazyValue, useLazyValuesCache } from "./use-lazy-value.js";
import { useTypedApiPromise } from "./use-typed-api.js";
import {
  type ChainId,
  type Chains,
  type CommonDescriptor,
  query as executeQuery,
  preflight,
  Query,
  type QueryError,
} from "@reactive-dot/core";
import type {
  Falsy,
  FlatHead,
  InferQueryPayload,
  MultiInstruction,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import { flatHead, stringify } from "@reactive-dot/utils/internal.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import { combineLatest, from, type Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import {
  computed,
  type MaybeRefOrGetter,
  type ShallowRef,
  toValue,
  type UnwrapRef,
} from "vue";

export function useLazyLoadQuery<
  TQuery extends (
    builder: Query<[], TDescriptor>,
  ) => Query<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy,
  TDescriptor extends TChainId extends void
    ? CommonDescriptor
    : Chains[TChainId],
  TChainId extends ChainId,
>(builder: TQuery, options?: ChainComposableOptions<TChainId>) {
  const chainId = internal_useChainId(options);
  const typedApiPromise = useTypedApiPromise(options);
  const cache = useLazyValuesCache();

  const responses = computed(() => {
    const query = builder(new Query([]));

    if (!query) {
      return;
    }

    if (query.instructions.length === 1) {
      return [
        queryInstruction(
          query.instructions.at(0)!,
          chainId,
          typedApiPromise,
          cache,
        ),
      ];
    }

    return query.instructions.map((instruction) => {
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

  type Data = FlatHead<
    InferQueryPayload<
      Exclude<ReturnType<Exclude<UnwrapRef<TQuery>, Falsy>>, Falsy>
    >
  >;

  type Return =
    Data extends Array<infer _>
      ? AsyncState<Data, QueryError> &
          PromiseLike<AsyncState<Data, QueryError, Data>>
      : AsyncState<Data> & PromiseLike<AsyncState<Data, QueryError, Data>>;

  return useAsyncData(
    refreshable(
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
    ),
  ) as Return;
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
