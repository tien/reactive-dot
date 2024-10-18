import { bestBlockAtom, finalizedBlockAtom } from "../stores/block.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
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
  const config = useConfig();
  const chainId = internal_useChainId(options);

  return useAtomValue(
    tag === "finalized"
      ? finalizedBlockAtom({ config, chainId })
      : bestBlockAtom({ config, chainId }),
  );
}
