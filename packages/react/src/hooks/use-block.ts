import {
  bestBlockAtomFamily,
  blockBodyAtomFamily,
  blockHeaderAtomFamily,
  finalizedBlockAtomFamily,
} from "../stores/block.js";
import type { ChainHookOptions } from "./types.js";
import { useChainId_INTERNAL } from "./use-chain-id.js";
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
  const chainId = useChainId_INTERNAL(options);

  return useAtomValue(
    tag === "finalized"
      ? finalizedBlockAtomFamily(chainId)
      : bestBlockAtomFamily(chainId),
  );
}

/**
 * Hook for fetching block's body.
 *
 * @param hashOrTag - Which block to target
 * @param options - Additional options
 * @returns The block's body
 */
export function useBlockBody(
  hashOrTag: "best" | "finalized" = "finalized",
  options?: ChainHookOptions,
) {
  return useAtomValue(
    blockBodyAtomFamily({ chainId: useChainId_INTERNAL(options), hashOrTag }),
  );
}

/**
 * Hook for fetching block's header.
 *
 * @param hashOrTag - Which block to target
 * @param options - Additional options
 * @returns The block's header
 */
export function useBlockHeader(
  hashOrTag: "best" | "finalized" = "finalized",
  options?: ChainHookOptions,
) {
  return useAtomValue(
    blockHeaderAtomFamily({ chainId: useChainId_INTERNAL(options), hashOrTag }),
  );
}
