export function findAllIndexes<T>(
  array: T[],
  predicate: (item: T) => boolean,
): number[] {
  return array.reduce((indexes, item, index) => {
    if (predicate(item)) {
      indexes.push(index);
    }

    return indexes;
  }, [] as number[]);
}
