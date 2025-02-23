const empty = Symbol("empty");

export function lazy<T>(get: () => T) {
  let value: T | typeof empty = empty;

  return () => {
    if (value !== empty) {
      return value;
    }

    value = get();
    return value;
  };
}
