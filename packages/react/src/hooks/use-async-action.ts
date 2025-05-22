import {
  type AsyncValue,
  idle,
  MutationError,
  pending,
} from "@reactive-dot/core";
import { useCallback, useState } from "react";
import type { Observable } from "rxjs";

/**
 * @internal
 * @group Hooks
 */
export function useAsyncAction<
  TArgs extends unknown[],
  TReturn extends Promise<unknown> | Observable<unknown>,
>(action: (...args: TArgs) => TReturn) {
  type Value =
    TReturn extends Promise<infer Value>
      ? Value
      : TReturn extends Observable<infer Value>
        ? Value
        : never;

  const [state, setState] = useState<AsyncValue<Value, MutationError>>(idle);

  const setError = useCallback(
    (reason?: unknown) => setState(MutationError.from(reason)),
    [],
  );

  const execute = useCallback(
    (...args: TArgs) => {
      const resolve = (value: unknown) => setState(value as Value);

      try {
        setState(pending);

        const result = action(...args);

        if (result instanceof Promise) {
          return result.then(resolve).catch(setError);
        } else {
          return result.subscribe({ next: resolve, error: setError });
        }
      } catch (error) {
        setError(error);
        throw error;
      }
    },
    [action, setError],
  );

  return [state, execute] as [state: typeof state, execute: typeof execute];
}
