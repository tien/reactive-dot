import type { polkadot } from "@polkadot-api/descriptors";

declare module "@reactive-dot/core" {
  export interface Chains {
    polkadot: typeof polkadot;
  }
}
