import type { polkadot, kusama, westend } from "@polkadot-api/descriptors";

declare module "@reactive-dot/core/types.js" {
  export interface Chains {
    polkadot: typeof polkadot;
    kusama: typeof kusama;
    westend: typeof westend;
  }
}
