import { DANGEROUS_ApiContext } from "../contexts/chain.js";
import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { useClient } from "./use-client.js";
import { useDescriptor } from "./use-descriptor.js";
import { type ChainId } from "@reactive-dot/core";
import type { ChainDescriptorOf } from "@reactive-dot/core/internal.js";
import { atom, useAtomValue } from "jotai";
import type { ChainDefinition, PolkadotClient, TypedApi } from "polkadot-api";
import { useContext } from "react";

/**
 * Hook for getting Polkadot-API typed API.
 *
 * @param options - Additional options
 * @returns Polkadot-API typed API
 */
export function useTypedApi<TChainId extends ChainId | undefined>(
  options?: ChainHookOptions<TChainId>,
) {
  const client = useClient(options);
  const descriptor = useDescriptor(options);

  const dangerousApi = useContext(DANGEROUS_ApiContext);

  return useAtomValue(
    dangerousApi !== undefined
      ? atom(dangerousApi)
      : typedApiAtom({ client, descriptor }),
  ) as TypedApi<ChainDescriptorOf<TChainId>>;
}

/**
 * @internal
 */
export const typedApiAtom = atomFamilyWithErrorCatcher(
  (
    param: { client: PolkadotClient; descriptor: ChainDefinition | undefined },
    withErrorCatcher,
  ) =>
    withErrorCatcher(atom)(() =>
      param.descriptor === undefined
        ? (param.client.getUnsafeApi() as unknown as TypedApi<ChainDefinition>)
        : param.client.getTypedApi(param.descriptor),
    ),
  (a, b) => a.client === b.client && a.descriptor === b.descriptor,
);
