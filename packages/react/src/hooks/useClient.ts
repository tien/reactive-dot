import { chainIdAtom, clientAtomFamily } from "../stores/client.js";
import { ChainId } from "../types.js";
import { useAtomValue } from "jotai";

export const useClient = (options?: { chainId?: ChainId }) => {
  const defaultChainId = useAtomValue(chainIdAtom);
  const chainId = options?.chainId ?? defaultChainId;

  if (chainId === undefined) {
    throw new Error("No chain ID provided");
  }

  return useAtomValue(clientAtomFamily(chainId));
};
