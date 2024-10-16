import { lazyValuesKey } from "../keys.js";
import { refreshable } from "../utils/refreshable.js";
import { ReactiveDotError } from "@reactive-dot/core";
import {
  type MaybeRefOrGetter,
  type ShallowRef,
  computed,
  inject,
  shallowRef,
  toValue,
} from "vue";

type Key = string | number;

/**
 * @internal
 */
export function useLazyValue<T>(key: MaybeRefOrGetter<Key[]>, get: () => T) {
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

export function lazyValue<T>(
  key: MaybeRefOrGetter<Key[]>,
  get: () => T,
  cache: MaybeRefOrGetter<Map<string, ShallowRef<unknown>>>,
) {
  const put = (force = false) => {
    const stringKey = toValue(key).join("/");

    const refValue = (toValue(cache).get(stringKey) ??
      toValue(cache)
        .set(stringKey, shallowRef(get()))
        .get(stringKey)!) as ShallowRef<T>;

    if (force) {
      refValue.value = get();
    }

    return refValue.value;
  };

  return refreshable(
    computed(() => put()),
    () => void put(true),
  );
}
