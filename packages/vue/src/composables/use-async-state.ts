import type { MutableAsyncState } from "./types.js";
import { shallowRef } from "vue";

/**
 * @internal
 */
export function useAsyncState<T>() {
  return {
    data: shallowRef(),
    error: shallowRef(),
    status: shallowRef("idle"),
  } as MutableAsyncState<T>;
}
