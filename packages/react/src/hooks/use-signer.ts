import { SignerContext } from "../contexts/signer.js";
import { use } from "react";

/**
 * Hook for getting the current signer.
 *
 * @returns The current signer
 */
export function useSigner() {
  return use(SignerContext);
}
