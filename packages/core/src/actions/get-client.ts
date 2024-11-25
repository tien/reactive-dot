import type { ChainConfig } from "../config.js";
import {
  createClientFromLightClientProvider,
  isLightClientProvider,
  type LightClientProvider,
} from "../providers/light-client/provider.js";
import { createClient } from "polkadot-api";
import type { JsonRpcProvider } from "polkadot-api/ws-provider/web";

export async function getClient(chainConfig: ChainConfig) {
  const providerOrGetter = await chainConfig.provider;

  if (isLightClientProvider(providerOrGetter)) {
    return createClientFromLightClientProvider(providerOrGetter);
  }

  // Hack to detect wether function is a `JsonRpcProvider` or a getter of `JsonRpcProvider`
  const providerOrController = await (providerOrGetter.length > 0
    ? (providerOrGetter as JsonRpcProvider | LightClientProvider)
    : (
        providerOrGetter as Exclude<
          typeof providerOrGetter,
          JsonRpcProvider | LightClientProvider
        >
      )());

  if (isLightClientProvider(providerOrController)) {
    return createClientFromLightClientProvider(providerOrController);
  }

  return createClient(providerOrController);
}
