import type { ChainId } from "@reactive-dot/types";

// eslint-disable-next-line @typescript-eslint/ban-types
export type ChainHookOptions<T = {}> = T & {
  /**
   * Override default chain ID
   */
  chainId?: ChainId;
};
