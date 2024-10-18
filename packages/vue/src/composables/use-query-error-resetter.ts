import { erroredSymbol, useLazyValuesCache } from "./use-lazy-value.js";
import { toValue } from "vue";

/**
 * Composable for getting the function to reset all query errors.
 *
 * @returns Function to reset caught query error
 */
export function useQueryErrorResetter() {
  const cache = useLazyValuesCache();

  return () =>
    toValue(cache).forEach((value, key) => {
      if (erroredSymbol in value) {
        toValue(cache).delete(key);
      }
    });
}
