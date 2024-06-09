import { ReDotError } from "@reactive-dot/core";
import { atomWithDefault } from "jotai/utils";
import type { PolkadotSigner } from "polkadot-api";

export const signerAtom = atomWithDefault<PolkadotSigner>(() => {
  throw new ReDotError("No signer provided");
});
