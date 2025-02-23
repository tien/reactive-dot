/**
 * Given an array & a list of items and their indexes, interlace the items into the array at the specified indexes.
 *
 * @param array - The array to interlace the items into.
 * @param itemsWithIndexes - The items to interlace into the array, along with their indexes.
 * @returns The array with the items interlaced into it.
 */
export function interlace<T>(
  array: readonly T[],
  itemsWithIndexes: ReadonlyArray<readonly [T, number]>,
): T[] {
  const result = array.slice();

  for (const [item, index] of itemsWithIndexes) {
    result.splice(index, 0, item);
  }

  return result;
}
