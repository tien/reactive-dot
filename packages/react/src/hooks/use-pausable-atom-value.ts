import { SubscriptionContext } from "../contexts/query-options.js";
import type { atomWithObservableAndPromise } from "../utils/jotai/atom-with-observable-and-promise.js";
import { useAtomValue } from "./use-atom-value.js";
import { use } from "react";

export function usePausableAtomValue<T>(
  pausableAtom: ReturnType<typeof atomWithObservableAndPromise<T, never>>,
  options?: Parameters<typeof useAtomValue>[1],
) {
  return useAtomValue(
    use(SubscriptionContext).active
      ? pausableAtom.observableAtom
      : pausableAtom.promiseAtom,
    options,
  );
}
