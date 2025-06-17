export function omit<
  TRecord extends Record<string, unknown>,
  TKey extends keyof TRecord,
>(object: TRecord, keys: TKey[]) {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => !keys.includes(key as TKey)),
  ) as Omit<TRecord, TKey>;
}
