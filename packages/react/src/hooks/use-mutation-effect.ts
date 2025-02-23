import {
  type MutationEvent,
  MutationEventSubjectContext,
} from "../contexts/mutation.js";
import { use, useEffect } from "react";

/**
 * Hook that watches for mutation events.
 *
 * @param effect - Callback when new mutation event is emitted
 */
export function useMutationEffect(effect: (event: MutationEvent) => void) {
  const mutationEventSubject = use(MutationEventSubjectContext);

  useEffect(() => {
    const subscription = mutationEventSubject.subscribe({ next: effect });

    return () => subscription.unsubscribe();
  }, [mutationEventSubject, effect]);
}
