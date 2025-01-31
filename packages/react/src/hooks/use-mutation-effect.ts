import {
  type MutationEvent,
  MutationEventSubjectContext,
} from "../contexts/mutation.js";
// eslint-disable-next-line @eslint-react/no-use-context
import { useContext, useEffect } from "react";

/**
 * Hook that watches for mutation events.
 *
 * @param effect - Callback when new mutation event is emitted
 */
export function useMutationEffect(effect: (event: MutationEvent) => void) {
  // eslint-disable-next-line @eslint-react/no-use-context
  const mutationEventSubject = useContext(MutationEventSubjectContext);

  useEffect(() => {
    const subscription = mutationEventSubject.subscribe({ next: effect });

    return () => subscription.unsubscribe();
  }, [mutationEventSubject, effect]);
}
