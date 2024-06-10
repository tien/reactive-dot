import { connectedWalletsAtom, walletsAtom } from "../stores/wallets.js";
import { useAtomValue } from "jotai";

export const useWallets = () => useAtomValue(walletsAtom);

export const useConnectedWallets = () => useAtomValue(connectedWalletsAtom);
