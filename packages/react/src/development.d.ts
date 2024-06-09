import "@reactive-dot/types";
import { ChainDefinition } from "polkadot-api";

declare module "@reactive-dot/types" {
  export interface Chains {
    [id: string]: ChainDefinition;
  }
}
