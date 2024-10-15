import type { ChainComposableOptions, ReadonlyAsyncState } from "./types.js";
import { useAsyncData, useLazyValue } from "./use-async-data.js";
import { useTypedApiPromise } from "./use-typed-api.js";
import {
  type ChainId,
  type Chains,
  type CommonDescriptor,
  query as executeQuery,
  preflight,
  Query,
  QueryError,
} from "@reactive-dot/core";
import type {
  Falsy,
  FlatHead,
  InferQueryPayload,
  MultiInstruction,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import { stringify } from "@reactive-dot/utils/internal.js";
import { from, type Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import {
  computed,
  type MaybeRef,
  type MaybeRefOrGetter,
  onWatcherCleanup,
  type Ref,
  toValue,
  unref,
  type UnwrapRef,
  watchEffect,
} from "vue";

export function useLazyLoadQuery<
  TQuery extends MaybeRef<
    | ((
        builder: Query<[], TDescriptor>,
      ) => Query<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy
  >,
  TDescriptor extends TChainId extends void
    ? CommonDescriptor
    : Chains[TChainId],
  TChainId extends ChainId,
>(builder: TQuery, options?: ChainComposableOptions<TChainId>) {
  const responses = computed(() => {
    const builderValue = unref(builder);

    if (!builderValue) {
      return;
    }

    const query = builderValue(new Query([]));

    if (!query) {
      return;
    }

    if (query.instructions.length === 0) {
      return useAsyncData(
        useQueryInstructionFuture(query.instructions.at(0)!, options),
      );
    }

    return query.instructions
      .flatMap((instruction) => {
        if (!("multi" in instruction)) {
          return useQueryInstructionFuture(instruction, options);
        }

        return (instruction.args as unknown[]).map((args) => {
          const { multi, ...rest } = instruction;
          return useQueryInstructionFuture({ ...rest, args }, options);
        });
      })
      .map(useAsyncData);
  });

  type Data = FlatHead<
    InferQueryPayload<
      Exclude<ReturnType<Exclude<UnwrapRef<TQuery>, Falsy>>, Falsy>
    >
  >;

  const { promise, resolve, reject } =
    Promise.withResolvers<ReadonlyAsyncState<Data, unknown, Data>>();

  const state = {
    data: computed(() =>
      !Array.isArray(responses.value)
        ? responses.value?.data
        : responses.value.map((response) => response.data),
    ),
    error: computed(() => {
      if (!Array.isArray(responses.value)) {
        return responses.value?.error;
      }

      const errorResponses = responses.value.filter(
        (response) => response.error.value !== undefined,
      );

      if (errorResponses.length === 0) {
        return;
      }

      return QueryError.from(
        new AggregateError(
          errorResponses.map((response) => response.error.value),
        ),
      );
    }),
    status: computed(() => {
      if (!Array.isArray(responses.value)) {
        return responses.value?.status;
      }

      if (
        responses.value.some((response) => response.status.value === "error")
      ) {
        return "error";
      }

      if (
        responses.value.some((response) => response.status.value === "pending")
      ) {
        return "pending";
      }

      if (
        responses.value.every((response) => response.status.value === "success")
      ) {
        return "success";
      }

      return "idle";
    }),
  } as ReadonlyAsyncState<Data>;

  watchEffect(() => {
    const abortController = new AbortController();

    if (!Array.isArray(responses.value)) {
      responses.value?.then(
        () => {
          if (!abortController.signal.aborted) {
            resolve(state as ReadonlyAsyncState<Data, unknown, Data>);
          }
        },
        (error) => {
          if (!abortController.signal.aborted) {
            reject(error);
          }
        },
      );
    } else {
      Promise.all(responses.value.map((response) => response))
        .then(() => {
          if (!abortController.signal.aborted) {
            resolve(state as ReadonlyAsyncState<Data, unknown, Data>);
          }
        })
        .catch((error) => {
          if (!abortController.signal.aborted) {
            reject(error);
          }
        });
    }

    onWatcherCleanup(() => {
      abortController.abort();
    });
  });

  type RefProperties<T, TDefault = never> = {
    [P in keyof T]: Readonly<Ref<T[P] | TDefault>>;
  };

  type Return =
    Data extends Array<infer _>
      ? ReadonlyAsyncState<RefProperties<Data, undefined>> &
          PromiseLike<
            ReadonlyAsyncState<
              RefProperties<Data>,
              unknown,
              RefProperties<Data>
            >
          >
      : ReadonlyAsyncState<Data> &
          PromiseLike<ReadonlyAsyncState<Data, unknown, Data>>;

  return {
    ...state,
    then: (
      onfulfilled: () => unknown,
      onrejected: (reason: unknown) => unknown,
    ) => promise.then(onfulfilled, onrejected),
  } as unknown as Return;
}

function useQueryInstructionFuture(
  instruction: MaybeRefOrGetter<
    Exclude<
      QueryInstruction,
      MultiInstruction<// @ts-expect-error need any empty object here
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {}>
    >
  >,
  options?: ChainComposableOptions,
) {
  const typedApiPromise = useTypedApiPromise(options);

  return useLazyValue(
    computed(() => `query/${stringify(toValue(instruction))}`),
    computed(() => {
      const instructionValue = toValue(instruction);
      const preflightResult = preflight(instructionValue);
      const typedApiPromiseValue = toValue(typedApiPromise);

      return () => {
        switch (preflightResult) {
          case "promise":
            return typedApiPromiseValue.then(
              (typedApi) =>
                executeQuery(typedApi, instructionValue) as Promise<unknown>,
            );
          case "observable":
            return from(typedApiPromiseValue).pipe(
              switchMap(
                (typedApi) =>
                  executeQuery(
                    typedApi,
                    instructionValue,
                  ) as Observable<unknown>,
              ),
            );
        }
      };
    }),
  );
}
