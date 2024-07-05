import type { ChainId } from "@reactive-dot/core";

// eslint-disable-next-line @typescript-eslint/ban-types
export type ChainHookOptions<TChainId extends ChainId = ChainId, T = {}> = T & {
  /**
   * Override default chain ID
   */
  chainId?: TChainId;
};
