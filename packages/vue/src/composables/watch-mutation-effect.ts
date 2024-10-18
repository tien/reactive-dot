import { mutationEventKey } from "../keys.js";
import type { MutationEvent } from "../types.js";
import { inject, watch } from "vue";

/**
 * Watch for mutation events.
 *
 * @param effect - Callback when new mutation event is emitted
 */
export function watchMutationEffect(effect: (event: MutationEvent) => void) {
  watch(inject(mutationEventKey)!, (event) => {
    if (event !== undefined) {
      effect(event);
    }
  });
}
