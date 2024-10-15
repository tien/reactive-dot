import type { AsyncState } from "./types.js";
import { MutationError } from "@reactive-dot/core";
import { shallowRef } from "vue";

/**
 * @internal
 */
export function useAsyncAction<TActionArgs extends unknown[], TActionResult>(
  action: (...args: TActionArgs) => TActionResult,
) {
  const state = {
    data: shallowRef(),
    error: shallowRef(),
    status: shallowRef("idle"),
  } as AsyncState<Awaited<TActionResult>>;

  return {
    ...state,
    execute: async (...args: TActionArgs) => {
      try {
        state.status.value = "pending";
        state.data.value = await action(...args);
        state.status.value = "success";
      } catch (error: unknown) {
        state.error.value = MutationError.from(error);
        state.status.value = "error";
      }
    },
  };
}
