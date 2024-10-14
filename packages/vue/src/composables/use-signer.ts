import { signerKey } from "../keys.js";
import { computed, inject, toValue } from "vue";

/**
 * Composable for getting the current signer.
 *
 * @returns The current signer
 */
export function useSigner() {
  return computed(() => toValue(inject(signerKey)));
}
