import type { ChainId } from "@reactive-dot/core";

export type ChainHookOptions<TChainId extends ChainId = ChainId> = {
  /**
   * Override default chain ID
   */
  chainId?: TChainId;
};
