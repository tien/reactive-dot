import type { polkadot, kusama, westend } from "@polkadot-api/descriptors";

declare module "@reactive-dot/core" {
  export interface Chains {
    polkadot: typeof polkadot;
    kusama: typeof kusama;
    westend: typeof westend;
  }
}
