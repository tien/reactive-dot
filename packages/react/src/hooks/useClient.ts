import { chainIdAtom, clientAtomFamily } from "../stores/client.js";
import type { ChainId } from "@reactive-dot/types";
import { useAtomValue } from "jotai";

export const useClient = (options?: { chainId?: ChainId }) => {
  const defaultChainId = useAtomValue(chainIdAtom);
  const chainId = options?.chainId ?? defaultChainId;

  if (chainId === undefined) {
    throw new Error("No chain ID provided");
  }

  return useAtomValue(clientAtomFamily(chainId));
};
