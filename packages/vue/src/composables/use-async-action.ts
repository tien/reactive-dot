import { useAsyncState } from "./use-async-state.js";
import { MutationError } from "@reactive-dot/core";
import { type Observable, Subject } from "rxjs";

/**
 * @internal
 */
export function useAsyncAction<
  TActionArgs extends unknown[],
  TActionResult extends Promise<unknown> | Observable<unknown>,
>(action: (...args: TActionArgs) => TActionResult) {
  type Value =
    TActionResult extends Promise<infer Value>
      ? Value
      : TActionResult extends Observable<infer Value>
        ? Value
        : never;

  const state = useAsyncState<Value>();

  type ExecuteReturn =
    TActionResult extends Promise<infer Value>
      ? Promise<Value>
      : TActionResult extends Observable<infer Value>
        ? Subject<Value>
        : never;

  return {
    ...state,
    execute: (...args: TActionArgs): ExecuteReturn => {
      try {
        state.status.value = "pending";

        const result = action(...args);

        const resolve = (value: unknown) => {
          state.data.value = value as Value;
          state.status.value = "success";
        };

        const reject = (reason: unknown) => {
          state.error.value = MutationError.from(reason);
          state.status.value = "error";
        };

        if (result instanceof Promise) {
          return result.then(resolve).catch((error) => {
            reject(error);
            throw error;
          }) as ExecuteReturn;
        } else {
          const subject = new Subject();

          result.subscribe({
            next: (value) => {
              resolve(value);
              subject.next(value);
            },
            error: (error) => {
              reject(error);
              subject.error(error);
            },
            complete: () => subject.complete(),
          });

          return subject as ExecuteReturn;
        }
      } catch (error: unknown) {
        state.error.value = MutationError.from(error);
        state.status.value = "error";
        throw error;
      }
    },
  };
}
