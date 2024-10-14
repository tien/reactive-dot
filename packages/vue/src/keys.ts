import type { PolkadotSigner } from "@polkadot-api/polkadot-signer";
import type { ChainId, Config } from "@reactive-dot/core";
import type { InjectionKey, MaybeRefOrGetter, ShallowRef } from "vue";

export const configKey = Symbol() as InjectionKey<MaybeRefOrGetter<Config>>;

export const chainIdKey = Symbol() as InjectionKey<MaybeRefOrGetter<ChainId>>;

export const signerKey = Symbol() as InjectionKey<
  MaybeRefOrGetter<PolkadotSigner>
>;

/**
 * @internal
 */
export const lazyValuesKey = Symbol() as InjectionKey<
  MaybeRefOrGetter<Map<string, ShallowRef<unknown>>>
>;
