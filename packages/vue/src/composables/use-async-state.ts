import type { AsyncState } from "./types.js";
import { shallowRef } from "vue";

/**
 * @internal
 */
export function useAsyncState<T>() {
  return {
    data: shallowRef(),
    error: shallowRef(),
    status: shallowRef("idle"),
  } as AsyncState<T>;
}
