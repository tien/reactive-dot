import type { ChainId } from "@reactive-dot/core";
import type { MaybeRefOrGetter, Ref } from "vue";

export type ChainComposableOptions<TChainId extends ChainId = ChainId> = {
  /**
   * Override default chain ID
   */
  chainId?: MaybeRefOrGetter<TChainId>;
};

export type AsyncState<TData, TError = unknown> = {
  data: Ref<TData | undefined>;
  error: Ref<TError | undefined>;
  status: Ref<"idle" | "pending" | "success" | "error">;
};

export type ReadonlyAsyncState<TData, TError = unknown> = {
  data: Readonly<Ref<TData>>;
  error: Readonly<Ref<TError | undefined>>;
  status: Readonly<Ref<"idle" | "pending" | "success" | "error">>;
};
