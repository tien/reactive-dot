import type { Observable } from "rxjs";

export type StringKeyOf<T> = Extract<keyof T, string>;

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

export type ExtractProperties<T, U> = {
  [P in keyof T as U extends T[P] ? P : never]: T[P];
};

export type ExtractExactProperties<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

export type ExcludeProperties<T, U> = {
  [P in keyof T as U extends T[P] ? never : P]: T[P];
};

export type ExcludeExactProperties<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

export type UndefinedToOptional<T> = {
  [P in keyof T as T[P] extends undefined
    ? never
    : undefined extends T[P]
      ? P
      : never]?: Exclude<T[P], undefined>;
} & {
  [P in keyof T as undefined extends T[P] ? never : P]: T[P];
};

// https://github.com/microsoft/TypeScript/issues/55667
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PatchedReturnType<T extends (...args: never) => any> = T extends (
  ...args: never
) => infer R
  ? R
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any;

export type Finality = "best" | "finalized";

export type At = Finality | `0x${string}`;
