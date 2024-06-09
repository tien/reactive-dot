import type { polkadot, kusama } from "@polkadot-api/descriptors";

declare module "@reactive-dot/types" {
  export interface Chains {
    polkadot: typeof polkadot;
    kusama: typeof kusama;
  }
}
