import { accountsAtom } from "../stores/accounts.js";
import { useAtomValue } from "jotai";

/**
 * Hook for getting currently connected accounts.
 *
 * @returns The currently connected accounts
 */
export const useAccounts = () => useAtomValue(accountsAtom);
