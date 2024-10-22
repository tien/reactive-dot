export function flatHead<T>(value: T): T extends [infer Head] ? Head : T {
  if (Array.isArray(value) && value.length === 1) {
    return value.at(0);
  }

  // @ts-expect-error TODO: fix this
  return value;
}
