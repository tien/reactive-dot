import { lazyValuesKey } from "../keys.js";
import { ReactiveDotError } from "@reactive-dot/core";
import {
  type MaybeRefOrGetter,
  type ShallowRef,
  computed,
  toValue,
  shallowRef,
  inject,
} from "vue";

/**
 * @internal
 */
export function useLazyValue<T>(key: MaybeRefOrGetter<string>, get: () => T) {
  return lazyValue(key, get, useLazyValuesCache());
}

/**
 * @internal
 */
export function useLazyValuesCache() {
  const cache = inject(lazyValuesKey);

  if (cache === undefined) {
    throw new ReactiveDotError("No lazy values cache provided");
  }

  return cache;
}

/**
 * @internal
 */
export function lazyValue<T>(
  key: MaybeRefOrGetter<string>,
  get: () => T,
  cache: MaybeRefOrGetter<Map<string, ShallowRef<unknown>>>,
) {
  return computed(
    () =>
      (toValue(cache).get(toValue(key))?.value ??
        toValue(cache).set(toValue(key), shallowRef(get())).get(toValue(key))!
          .value) as T,
  );
}
