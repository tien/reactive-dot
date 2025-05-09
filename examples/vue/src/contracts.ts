import { contracts } from "@polkadot-api/descriptors";
import { defineContract } from "@reactive-dot/core";

export const psp22 = defineContract({ descriptor: contracts.psp22 });

export const flipper = defineContract({
  descriptor: contracts.flipper,
});
