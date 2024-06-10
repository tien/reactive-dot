import { ChainIdContext } from "../context.js";
import {
  bestBlockAtomFamily,
  finalizedBlockAtomFamily,
} from "../stores/block.js";
import { ReDotError } from "@reactive-dot/core";
import { ChainId } from "@reactive-dot/types";
import { useAtomValue } from "jotai";
import { useContext } from "react";

export const useBlock = (
  tag: "best" | "finalized" = "finalized",
  options?: { chainId?: ChainId },
) => {
  const contextChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (chainId === undefined) {
    throw new ReDotError("No chain Id provided");
  }

  return useAtomValue(
    tag === "finalized"
      ? finalizedBlockAtomFamily(chainId)
      : bestBlockAtomFamily(chainId),
  );
};
