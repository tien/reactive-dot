import { chainConfigsAtom } from "./config.js";
import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider";
import { ReDotError } from "@reactive-dot/core";
import type { ChainId } from "@reactive-dot/types";
import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { createClient } from "polkadot-api";

export const chainIdAtom = atom<ChainId | undefined>(undefined);

export const clientAtomFamily = atomFamily((chainId: ChainId) =>
  atom(async (get) => {
    const chainConfig = get(chainConfigsAtom)[chainId];

    if (chainConfig === undefined) {
      throw new ReDotError(`No config provided for ${chainId}`);
    }

    const providerOrGetter = await chainConfig.provider;

    // Hack to detect wether function is a `JsonRpcProvider` or a getter of `JsonRpcProvider`
    const provider = await (providerOrGetter.length > 0
      ? (providerOrGetter as JsonRpcProvider)
      : (
          providerOrGetter as Exclude<typeof providerOrGetter, JsonRpcProvider>
        )());

    return createClient(provider);
  }),
);

export const typedApiAtomFamily = atomFamily((chainId: ChainId) =>
  atom(async (get) => {
    const config = get(chainConfigsAtom)[chainId];

    if (config === undefined) {
      throw new ReDotError(`No config provided for chain ${chainId}`);
    }

    const client = await get(clientAtomFamily(chainId));

    return client.getTypedApi(config.descriptor);
  }),
);
