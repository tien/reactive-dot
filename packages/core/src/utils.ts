import { from, isObservable, of, type Observable } from "rxjs";

function hasObjectPrototype(o: unknown) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

function isPlainObject(value: unknown): value is object {
  if (!hasObjectPrototype(value)) {
    return false;
  }

  // If has modified constructor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctor = (value as any).constructor;
  if (typeof ctor === "undefined") return true;

  // If has modified prototype
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) return false;

  // If constructor does not have an Object-specific method
  // eslint-disable-next-line no-prototype-builtins
  if (!prot.hasOwnProperty("isPrototypeOf")) return false;

  // Most likely a plain Object
  return true;
}

export function stringify<T>(queryInstruction: T) {
  return JSON.stringify(queryInstruction, (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }

    if (isPlainObject(value)) {
      return Object.keys(value)
        .sort()
        .reduce(
          (result, key) => {
            result[key] = value[key as keyof typeof value];
            return result;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {} as any,
        );
    }

    return value;
  });
}

export function flatHead<T>(value: T): T extends [infer Head] ? Head : T {
  if (Array.isArray(value) && value.length === 1) {
    return value.at(0);
  }

  // @ts-expect-error TODO: fix this
  return value;
}

export function maybeThen<TValueIn, TValueOut>(
  maybePromise: TValueIn | Promise<TValueIn>,
  then: (value: TValueIn) => TValueOut,
) {
  if (maybePromise instanceof Promise) {
    return maybePromise.then(then);
  }

  return then(maybePromise);
}

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
