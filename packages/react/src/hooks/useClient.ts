import { ChainIdContext } from "../context.js";
import { clientAtomFamily } from "../stores/client.js";
import { ReDotError } from "@reactive-dot/core";
import type { ChainId } from "@reactive-dot/types";
import { useAtomValue } from "jotai";
import { useContext } from "react";

export const useClient = (options?: { chainId?: ChainId }) => {
  const defaultChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? defaultChainId;

  if (chainId === undefined) {
    throw new ReDotError("No chain ID provided");
  }

  return useAtomValue(clientAtomFamily(chainId));
};
