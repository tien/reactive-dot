import { signerKey } from "../keys.js";
import type { PolkadotSigner } from "@polkadot-api/polkadot-signer";
import { provide, type MaybeRefOrGetter } from "vue";

export function provideSigner(signer: MaybeRefOrGetter<PolkadotSigner>) {
  provide(signerKey, signer);
}
