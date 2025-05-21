import { createStore, getDefaultStore, useStore } from "jotai";
import { useMemo } from "react";

/**
 * @internal
 * @group Hooks
 */
export function useLocalStore() {
  const contextStore = useStore();

  return useMemo(
    () => (contextStore === getDefaultStore() ? createStore() : contextStore),
    [contextStore],
  );
}
