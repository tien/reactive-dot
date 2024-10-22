import { from, isObservable, of, type Observable } from "rxjs";

export function toObservable<T>(value: T) {
  type Value =
    T extends Observable<infer _>
      ? T
      : T extends Promise<infer Value>
        ? Observable<Value>
        : Observable<T>;

  if (isObservable(value)) {
    return value as Value;
  }

  if (value instanceof Promise) {
    return from(value) as Value;
  }

  return of(value) as Value;
}
