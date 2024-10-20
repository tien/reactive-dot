import type { ChainId, MutationError } from "@reactive-dot/core";
import type { MutationEvent as BaseMutationEvent } from "@reactive-dot/core/internal.js";
import type { TxEvent } from "polkadot-api";
import type { MaybeRefOrGetter, Ref } from "vue";

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

export type MutationEvent = BaseMutationEvent &
  (
    | { status: "pending" }
    | { status: "error"; error: MutationError }
    | { status: "success"; data: TxEvent }
  );
