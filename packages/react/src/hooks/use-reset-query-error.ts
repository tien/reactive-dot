import { resetQueryError } from "../utils/jotai.js";

/**
 * Hook for getting function to reset query error caught by error boundary
 *
 * @returns Function to reset caught query error
 */
export function useResetQueryError() {
  return resetQueryError;
}
