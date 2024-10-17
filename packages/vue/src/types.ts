import type { ChainId, MutationError } from "@reactive-dot/core";
import type { MutationEvent as BaseMutationEvent } from "@reactive-dot/core/internal.js";
import type { TxEvent } from "polkadot-api";
import type { MaybeRefOrGetter, Ref } from "vue";

export type ChainComposableOptions<TChainId extends ChainId = ChainId> = {
  /**
   * Override default chain ID
   */
  chainId?: MaybeRefOrGetter<TChainId>;
};

export type MutableAsyncState<TData, TError = unknown, TDefault = undefined> = {
  data: Ref<TData | TDefault>;
  error: Ref<TError | undefined>;
  status: Ref<"idle" | "pending" | "success" | "error">;
};

export type AsyncState<TData, TError = unknown, TDefault = undefined> = {
  data: Readonly<Ref<TData | TDefault>>;
  error: Readonly<Ref<TError | undefined>>;
  status: Readonly<Ref<"idle" | "pending" | "success" | "error">>;
  refresh: () => void;
};

export type MutationEvent = BaseMutationEvent &
  (
    | { status: "pending" }
    | { status: "error"; error: MutationError }
    | { status: "success"; data: TxEvent }
  );
