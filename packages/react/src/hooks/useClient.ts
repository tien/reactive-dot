import { chainIdAtom, clientAtomFamily } from "../stores/client.js";
import { ReDotError } from "@reactive-dot/core";
import type { ChainId } from "@reactive-dot/types";
import { useAtomValue } from "jotai";

export const useClient = (options?: { chainId?: ChainId }) => {
  const defaultChainId = useAtomValue(chainIdAtom);
  const chainId = options?.chainId ?? defaultChainId;

  if (chainId === undefined) {
    throw new ReDotError("No chain ID provided");
  }

  return useAtomValue(clientAtomFamily(chainId));
};
