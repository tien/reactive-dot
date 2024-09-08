import { resetQueryError } from "../utils/jotai.js";

/**
 * Hook for getting function to reset query error caught by error boundary
 *
 * @returns Function to reset caught query error
 */
// eslint-disable-next-line @eslint-react/hooks-extra/no-redundant-custom-hook
export function useQueryErrorResetter() {
  return resetQueryError;
}
