import { useRef } from "react";

/**
 * @internal
 * @group Hooks
 */
export function useRenderEffect<T>(effect: () => void, key: T) {
  const prevKey = useRef(key);
  const currKey = useRef(prevKey.current);

  currKey.current = key;

  if (prevKey.current !== currKey.current) {
    prevKey.current = currKey.current;
    effect();
  }
}
