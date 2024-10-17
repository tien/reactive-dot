import type { AsyncState } from "../types.js";
import { refresh } from "../utils/refreshable.js";
import { useAsyncState } from "./use-async-state.js";
import type { lazyValue } from "./use-lazy-value.js";
import type { Falsy } from "@reactive-dot/core/internal.js";
import type { Observable, Subscription } from "rxjs";
import { onWatcherCleanup, shallowReadonly, toValue, watchEffect } from "vue";

/**
 * @internal
 */
export function useAsyncData<
  T extends Promise<unknown> | Observable<unknown> | Falsy,
>(future: ReturnType<typeof lazyValue<T>>) {
  type Value =
    T extends Promise<infer Value>
      ? Value
      : T extends Observable<infer Value>
        ? Value
        : never;

  const state = useAsyncState<Value>();

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

          state.data.value = value as Value;
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
          state.data.value = value as Value;
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

  const returnState = {
    data: shallowReadonly(state.data),
    error: shallowReadonly(state.error),
    status: shallowReadonly(state.status),
    refresh: () => refresh(future),
  } as AsyncState<Value>;

  const {
    promise: promiseLike,
    resolve,
    reject,
  } = Promise.withResolvers<AsyncState<Value>>();

  watchEffect(() => {
    switch (returnState.status.value) {
      case "success":
        resolve(returnState);
        break;
      case "error":
        reject(returnState.error.value);
    }
  });

  return {
    ...returnState,
    then: (
      onfulfilled: () => unknown,
      onrejected: (reason: unknown) => unknown,
    ) => promiseLike.then(onfulfilled, onrejected),
  } as AsyncState<Value> & PromiseLike<AsyncState<Value, unknown, Value>>;
}
