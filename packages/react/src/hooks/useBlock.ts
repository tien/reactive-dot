import { ChainIdContext } from "../context.js";
import {
  bestBlockAtomFamily,
  finalizedBlockAtomFamily,
} from "../stores/block.js";
import type { ChainHookOptions } from "./types.js";
import { ReDotError } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import { useContext } from "react";

/**
 * Hook for fetching information about the latest block.
 *
 * @param tag - Which block to target
 * @param options - Additional options
 * @returns The latest finalized or best block
 */
export const useBlock = (
  tag: "best" | "finalized" = "finalized",
  options?: ChainHookOptions,
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
