import type { Observable } from "rxjs";

export type Falsy = undefined | null | false;

export type FalsyGuard<
  TType,
  TReturnType,
  TFallback = undefined,
  TFalsyValues = Falsy,
> = TType extends TFalsyValues ? TReturnType | TFallback : TReturnType;

export type MaybePromise<T> = T | Promise<T>;

export type MaybeAsync<T> = T | Promise<T> | Observable<T>;

export type Gettable<T> = MaybePromise<T> | (() => MaybePromise<T>);

export type FlatHead<TArray extends unknown[]> = TArray extends [infer Head]
  ? Head
  : TArray;

export type Flatten<T extends unknown[]> = T extends [
  infer First,
  ...infer Rest,
]
  ? First extends unknown[]
    ? Flatten<[...First, ...Rest]>
    : [First, ...Rest]
  : [];
