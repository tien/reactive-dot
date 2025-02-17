import type { ChainId, MutationError, Query } from "@reactive-dot/core";
import type {
  MutationEvent as BaseMutationEvent,
  ChainDescriptorOf,
  Falsy,
  InferQueryPayload,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import type { TxEvent } from "polkadot-api";
import type { MaybeRef, MaybeRefOrGetter, Ref } from "vue";

export type ChainComposableOptions<
  TChainId extends ChainId | undefined = ChainId | undefined,
> = {
  /**
   * Override default chain ID
   */
  chainId?: MaybeRefOrGetter<TChainId>;
};

type DeepReadonly<T> = { [P in keyof T]: Readonly<T[P]> };

export type MutableAsyncState<TData, TError = unknown, TDefault = undefined> = {
  data: Ref<TData | TDefault>;
  error: Ref<TError | undefined>;
  status: Ref<"idle" | "pending" | "success" | "error">;
};

export type AsyncState<
  TData,
  TError = unknown,
  TDefault = undefined,
> = DeepReadonly<MutableAsyncState<TData, TError, TDefault>> & {
  refresh: () => void;
};

export type PromiseLikeAsyncState<TData, TError = unknown> = AsyncState<
  TData,
  TError
> &
  PromiseLike<AsyncState<TData, TError, TData>>;

export type MutationEvent = BaseMutationEvent &
  (
    | { status: "pending" }
    | { status: "error"; error: MutationError }
    | { status: "success"; data: TxEvent }
  );

export type QueryArgument<TChainId extends ChainId | undefined> = MaybeRef<
  | Query<
      QueryInstruction<ChainDescriptorOf<TChainId>>[],
      ChainDescriptorOf<TChainId>
    >
  | Falsy
  | ((
      query: Query<[], ChainDescriptorOf<TChainId>>,
    ) =>
      | Query<
          QueryInstruction<ChainDescriptorOf<TChainId>>[],
          ChainDescriptorOf<TChainId>
        >
      | Falsy)
>;

type MaybeFalsy<T> = T | Falsy;

export type InferQueryArgumentResult<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
> =
  TQuery extends MaybeRef<infer Q>
    ? Q extends MaybeFalsy<infer QT>
      ? QT extends Query
        ? InferQueryPayload<QT>
        : QT extends (...args: never[]) => MaybeFalsy<infer QTR>
          ? QTR extends Query
            ? InferQueryPayload<QTR>
            : never
          : never
      : never
    : never;
