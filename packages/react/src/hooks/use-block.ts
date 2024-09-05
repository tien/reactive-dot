import {
  bestBlockAtomFamily,
  finalizedBlockAtomFamily,
} from "../stores/block.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useAtomValue } from "jotai";

/**
 * Hook for fetching information about the latest block.
 *
 * @param tag - Which block to target
 * @param options - Additional options
 * @returns The latest finalized or best block
 */
export function useBlock(
  tag: "best" | "finalized" = "finalized",
  options?: ChainHookOptions,
) {
  const chainId = internal_useChainId(options);

  return useAtomValue(
    tag === "finalized"
      ? finalizedBlockAtomFamily(chainId)
      : bestBlockAtomFamily(chainId),
  );
}
