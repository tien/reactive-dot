import type { ChainId } from "@reactive-dot/core";

export type ChainHookOptions<
  TChainId extends ChainId | undefined = ChainId | undefined,
> = {
  /**
   * Override default chain ID
   */
  chainId?: TChainId;
};
