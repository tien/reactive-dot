import { type polkadot, type kusama } from "@polkadot-api/descriptors";

declare module "@reactive-dot/react" {
  export interface Chain {
    polkadot: typeof polkadot;
    kusama: typeof kusama;
  }
}
