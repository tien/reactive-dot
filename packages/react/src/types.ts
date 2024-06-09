export type Falsy = undefined | null | false;

export type FalsyGuard<
  TType,
  TReturnType,
  TFalsyValues = Falsy,
> = TType extends TFalsyValues ? TReturnType | undefined : TReturnType;

export type FlatHead<TArray extends unknown[]> = TArray extends [infer Head]
  ? Head
  : TArray;
