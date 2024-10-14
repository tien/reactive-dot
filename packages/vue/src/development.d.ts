import type { ChainDefinition } from "polkadot-api";

declare module "@reactive-dot/core" {
  export interface Chains {
    [id: string]: ChainDefinition;
  }
}
