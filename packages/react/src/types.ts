export type Falsy = undefined | null | false;

export type FalsyGuard<
  TType,
  TReturnType,
  TFallback = undefined,
  TFalsyValues = Falsy,
> = TType extends TFalsyValues ? TReturnType | TFallback : TReturnType;

export type FlatHead<TArray extends unknown[]> = TArray extends [infer Head]
  ? Head
  : TArray;
