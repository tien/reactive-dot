import type { ChainDefinition } from "polkadot-api";

declare module "@reactive-dot/core/internal.js" {
  export interface Chains {
    [id: string]: ChainDefinition;
  }
}
