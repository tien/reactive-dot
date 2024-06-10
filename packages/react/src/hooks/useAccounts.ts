import { accountsAtom } from "../stores/accounts.js";
import { useAtomValue } from "jotai";

export const useAccounts = () => useAtomValue(accountsAtom);
