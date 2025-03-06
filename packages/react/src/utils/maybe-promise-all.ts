export function maybePromiseAll<T extends unknown | Promise<unknown>>(
  maybePromises: T[],
) {
  return maybePromises.some((maybePromise) => maybePromise instanceof Promise)
    ? Promise.all(maybePromises)
    : maybePromises;
}
