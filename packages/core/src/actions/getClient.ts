import type { ChainConfig } from "../config.js";
import { createClient } from "polkadot-api";
import type { JsonRpcProvider } from "polkadot-api/ws-provider/web";

export async function getClient(chainConfig: ChainConfig) {
  const providerOrGetter = await chainConfig.provider;

  // Hack to detect wether function is a `JsonRpcProvider` or a getter of `JsonRpcProvider`
  const provider = await (providerOrGetter.length > 0
    ? (providerOrGetter as JsonRpcProvider)
    : (
        providerOrGetter as Exclude<typeof providerOrGetter, JsonRpcProvider>
      )());

  return createClient(provider);
}
