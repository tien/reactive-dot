import type { AsyncState, ReadonlyAsyncState } from "./types.js";
import type { Falsy } from "@reactive-dot/core/internal.js";
import type { Observable, Subscription } from "rxjs";
import {
  type MaybeRefOrGetter,
  onWatcherCleanup,
  shallowReadonly,
  shallowRef,
  toValue,
  watchEffect,
} from "vue";

/**
 * @internal
 */
export function useAsyncData<T>(
  future: MaybeRefOrGetter<Promise<T> | Observable<T> | Falsy>,
) {
  const state = {
    data: shallowRef(),
    error: shallowRef(),
    status: shallowRef("idle"),
  } as AsyncState<T>;

  watchEffect(() => {
    const promiseOrObservable = toValue(future);

    if (!promiseOrObservable) {
      return;
    }

    let abortController: AbortController | undefined;
    let subscription: Subscription | undefined;

    state.status.value = "pending";

    if (promiseOrObservable instanceof Promise) {
      abortController = new AbortController();

      promiseOrObservable
        .then((value) => {
          if (abortController!.signal.aborted) {
            return;
          }

          state.data.value = value;
          state.status.value = "success";
        })
        .catch((error) => {
          if (abortController!.signal.aborted) {
            return;
          }

          state.error.value = error;
          state.status.value = "error";
        });
    } else {
      subscription = promiseOrObservable.subscribe({
        next: (value) => {
          state.data.value = value;
          state.status.value = "success";
        },
        error: (error) => {
          state.error.value = error;
          state.status.value = "error";
        },
      });
    }

    onWatcherCleanup(() => {
      abortController?.abort();
      subscription?.unsubscribe();
    });
  });

  const readonlyState = {
    data: shallowReadonly(state.data),
    error: shallowReadonly(state.error),
    status: shallowReadonly(state.status),
  } as ReadonlyAsyncState<T>;

  const {
    promise: promiseLike,
    resolve,
    reject,
  } = Promise.withResolvers<ReadonlyAsyncState<T>>();

  watchEffect(() => {
    switch (readonlyState.status.value) {
      case "success":
        resolve(readonlyState);
        break;
      case "error":
        reject(readonlyState.error.value);
    }
  });

  return {
    ...readonlyState,
    then: (
      onfulfilled: () => unknown,
      onrejected: (reason: unknown) => unknown,
    ) => promiseLike.then(onfulfilled, onrejected),
  } as ReadonlyAsyncState<T> & PromiseLike<ReadonlyAsyncState<T, unknown, T>>;
}
