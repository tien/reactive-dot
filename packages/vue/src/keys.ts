import type { MutationEvent } from "./types.js";
import type { PolkadotSigner } from "@polkadot-api/polkadot-signer";
import type { ChainId, Config } from "@reactive-dot/core";
import type { InjectionKey, MaybeRefOrGetter, Ref, ShallowRef } from "vue";

export const configKey = Symbol("config") as InjectionKey<
  MaybeRefOrGetter<Config>
>;

export const chainIdKey = Symbol("chainId") as InjectionKey<
  MaybeRefOrGetter<ChainId>
>;

export const signerKey = Symbol("signer") as InjectionKey<
  MaybeRefOrGetter<PolkadotSigner>
>;

/**
 * @internal
 */
export const lazyValuesKey = Symbol("lazyValues") as InjectionKey<
  MaybeRefOrGetter<Map<string, ShallowRef<unknown>>>
>;

/**
 * @internal
 */
export const mutationEventKey = Symbol("mutationEvent") as InjectionKey<
  Ref<MutationEvent | undefined>
>;
