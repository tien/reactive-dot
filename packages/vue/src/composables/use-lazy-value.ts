import { lazyValuesKey } from "../keys.js";
import { refreshable } from "../utils/refreshable.js";
import { ReactiveDotError } from "@reactive-dot/core";
import { catchError, isObservable } from "rxjs";
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

/**
 * @internal
 */
export const erroredSymbol = Symbol("errored");

export function lazyValue<T>(
  key: MaybeRefOrGetter<Key[]>,
  get: () => T,
  cache: MaybeRefOrGetter<Map<string, ShallowRef<unknown>>>,
) {
  const put = (force = false) => {
    const stringKey = toValue(key).join("/");

    const hasValue = toValue(cache).has(stringKey);

    const refValue = (
      hasValue
        ? toValue(cache).get(stringKey)!
        : toValue(cache).set(stringKey, shallowRef()).get(stringKey)!
    ) as ShallowRef<T>;

    const tagAsErrored = () =>
      Object.assign(refValue, { [erroredSymbol]: true });

    if (!hasValue || force) {
      try {
        refValue.value = get();
      } catch (error) {
        tagAsErrored();
        throw error;
      }
    }

    if (refValue.value instanceof Promise) {
      refValue.value = refValue.value.catch((error) => {
        tagAsErrored();
        throw error;
      }) as T;
    } else if (isObservable(refValue.value)) {
      refValue.value = refValue.value.pipe(
        catchError((error) => {
          tagAsErrored();
          throw error;
        }),
      ) as T;
    }

    return refValue.value;
  };

  return refreshable(
    computed(() => put()),
    () => void put(true),
  );
}
