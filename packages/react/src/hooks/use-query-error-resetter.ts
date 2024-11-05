import { atomFamilyErrorsAtom } from "../utils/jotai.js";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for getting function to reset query error caught by error boundary
 *
 * @returns Function to reset caught query error
 */
export function useQueryErrorResetter() {
  return useAtomCallback(
    useCallback((get) => {
      const atomFamilyErrors = get(atomFamilyErrorsAtom);

      for (const error of atomFamilyErrors) {
        error.atomFamily.remove(error.param);
        atomFamilyErrors.delete(error);
      }
    }, []),
  );
}
