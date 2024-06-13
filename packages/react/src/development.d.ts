import { ChainDefinition } from "polkadot-api";

declare module "@reactive-dot/core/types.js" {
  export interface Chains {
    [id: string]: ChainDefinition;
  }
}
