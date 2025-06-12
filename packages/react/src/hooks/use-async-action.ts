import {
  idle,
  MutationError,
  pending,
  type AsyncValue,
} from "@reactive-dot/core";
import { useCallback, useState } from "react";
import { Subject, type Observable } from "rxjs";

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

  type ExecuteReturn =
    TReturn extends Promise<infer Value>
      ? Promise<Value>
      : TReturn extends Observable<infer Value>
        ? Subject<Value>
        : never;

  const execute = useCallback(
    (...args: TArgs): ExecuteReturn => {
      const resolve = (value: unknown) => setState(value as Value);

      try {
        setState(pending);

        const result = action(...args);

        if (result instanceof Promise) {
          return result.then(resolve).catch(setError) as ExecuteReturn;
        } else {
          const subject = new Subject();

          result.subscribe({
            next: (value) => {
              resolve(value);
              subject.next(value);
            },
            error: (error) => {
              setError(error);
              subject.error(error);
            },
            complete: () => subject.complete(),
          });

          return subject as ExecuteReturn;
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
