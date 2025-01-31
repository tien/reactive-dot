import { SignerContext } from "../contexts/signer.js";
// eslint-disable-next-line @eslint-react/no-use-context
import { useContext } from "react";

/**
 * Hook for getting the current signer.
 *
 * @returns The current signer
 */
export function useSigner() {
  // eslint-disable-next-line @eslint-react/no-use-context
  return useContext(SignerContext);
}
