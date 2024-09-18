import type { ChainId, Config } from "@reactive-dot/core";
import { getClient, ReactiveDotError } from "@reactive-dot/core";
import { atom } from "jotai";
import { atomFamily } from "jotai/utils";

export const clientAtomFamily = atomFamily(
  (param: { config: Config; chainId: ChainId }) =>
    atom(async () => {
      const chainConfig = param.config.chains[param.chainId];

      if (chainConfig === undefined) {
        throw new ReactiveDotError(`No config provided for ${param.chainId}`);
      }

      return getClient(chainConfig);
    }),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);

export const chainSpecDataAtomFamily = atomFamily(
  (param: { config: Config; chainId: ChainId }) =>
    atom(async (get) => {
      const client = await get(clientAtomFamily(param));

      return client.getChainSpecData();
    }),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);

export const typedApiAtomFamily = atomFamily(
  (param: { config: Config; chainId: ChainId }) =>
    atom(async (get) => {
      const config = param.config.chains[param.chainId];

      if (config === undefined) {
        throw new ReactiveDotError(
          `No config provided for chain ${param.chainId}`,
        );
      }

      const client = await get(clientAtomFamily(param));

      return client.getTypedApi(config.descriptor);
    }),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
