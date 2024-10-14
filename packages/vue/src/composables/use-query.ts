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
} from "@reactive-dot/core";
import type {
  Falsy,
  FlatHead,
  InferQueryPayload,
  MultiInstruction,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import { stringify } from "@reactive-dot/utils/internal.js";
import { combineLatest, from, type Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import {
  computed,
  type MaybeRef,
  type MaybeRefOrGetter,
  toValue,
  unref,
  type UnwrapRef,
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
      return [useQueryInstructionFuture(query.instructions.at(0)!, options)];
    }

    return query.instructions.flatMap((instruction) => {
      if (!("multi" in instruction)) {
        return useQueryInstructionFuture(instruction, options);
      }

      return (instruction.args as unknown[]).map((args) => {
        const { multi, ...rest } = instruction;
        return useQueryInstructionFuture({ ...rest, args }, options);
      });
    });
  });

  type Data = FlatHead<
    InferQueryPayload<
      Exclude<ReturnType<Exclude<UnwrapRef<TQuery>, Falsy>>, Falsy>
    >
  >;

  return useAsyncData(
    computed(() => {
      if (responses.value === undefined) {
        return;
      }

      if (responses.value.length === 1) {
        return responses.value.at(0)!.value;
      }

      return combineLatest(
        responses.value.map((response) => from(response.value)),
      );
    }),
  ) as ReadonlyAsyncState<Data> &
    PromiseLike<ReadonlyAsyncState<Data, unknown, Data>>;
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
