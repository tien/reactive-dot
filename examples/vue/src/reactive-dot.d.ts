import type { config } from "./config.js";
import type { InferChains } from "@reactive-dot/core";

declare module "@reactive-dot/core" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Chains extends InferChains<typeof config> {}
}
