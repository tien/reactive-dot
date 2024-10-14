import type { ChainComposableOptions } from "./types.js";
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
  MultiInstruction,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import { stringify } from "@reactive-dot/utils/internal.js";
import { from, type Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

export function useLazyLoadQuery<
  TQueryBuilder extends
    | ((
        builder: Query<[], TDescriptor>,
      ) => Query<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy,
  TDescriptor extends TChainId extends void
    ? CommonDescriptor
    : Chains[TChainId],
  TChainId extends ChainId,
>(
  builder: MaybeRefOrGetter<TQueryBuilder | Falsy>,
  options?: ChainComposableOptions<TChainId>,
) {
  const responses = computed(() => {
    const builderValue = toValue(builder);

    if (!builderValue) {
      return;
    }

    const query = builderValue(new Query([]));

    if (!query) {
      return;
    }

    if (query.instructions.length === 0) {
      return [useQueryInstructionPromise(query.instructions.at(0)!, options)];
    }

    return query.instructions.flatMap((instruction) => {
      if (!("multi" in instruction)) {
        return useQueryInstructionPromise(instruction, options);
      }

      return (instruction.args as unknown[]).map((args) => {
        const { multi, ...rest } = instruction;
        return useQueryInstructionPromise({ ...rest, args }, options);
      });
    });
  });

  return useAsyncData(
    computed(() => {
      if (responses.value === undefined) {
        return;
      }

      if (responses.value.length === 1) {
        return responses.value.at(0)!.value;
      }

      return Promise.all(responses.value.map((response) => response.value));
    }),
  );
}

function useQueryInstructionPromise(
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
