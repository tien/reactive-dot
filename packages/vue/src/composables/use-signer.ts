import { signerKey } from "../keys.js";
import { inject, toValue } from "vue";

/**
 * Composable for getting the current signer.
 *
 * @returns The current signer
 */
export function useSigner() {
  return toValue(inject(signerKey));
}
