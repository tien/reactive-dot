import { chainIdKey } from "../keys.js";
import type { ChainId } from "@reactive-dot/core";
import { provide, type MaybeRefOrGetter } from "vue";

export function provideChain(chainId: MaybeRefOrGetter<ChainId>) {
  provide(chainIdKey, chainId);
}
