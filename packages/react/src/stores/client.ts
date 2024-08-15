import { weakAtomFamily } from "../utils/jotai.js";
import { chainConfigsAtom } from "./config.js";
import type { ChainId } from "@reactive-dot/core";
import { getClient, ReDotError } from "@reactive-dot/core";
import { atom } from "jotai";

export const clientAtomFamily = weakAtomFamily((chainId: ChainId) =>
  atom(async (get) => {
    const chainConfig = get(chainConfigsAtom)[chainId];

    if (chainConfig === undefined) {
      throw new ReDotError(`No config provided for ${chainId}`);
    }

    return getClient(chainConfig);
  }),
);

export const chainSpecDataAtomFamily = weakAtomFamily((chainId: ChainId) =>
  atom(async (get) => {
    const client = await get(clientAtomFamily(chainId));

    return client.getChainSpecData();
  }),
);

export const typedApiAtomFamily = weakAtomFamily((chainId: ChainId) =>
  atom(async (get) => {
    const config = get(chainConfigsAtom)[chainId];

    if (config === undefined) {
      throw new ReDotError(`No config provided for chain ${chainId}`);
    }

    const client = await get(clientAtomFamily(chainId));

    return client.getTypedApi(config.descriptor);
  }),
);
