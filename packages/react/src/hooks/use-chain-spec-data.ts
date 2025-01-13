import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { useClient } from "./use-client.js";
import { atom, useAtomValue } from "jotai";
import type { PolkadotClient } from "polkadot-api";

/**
 * Hook for fetching the [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html).
 *
 * @param options - Additional options
 * @returns The [JSON-RPC spec](https://paritytech.github.io/json-rpc-interface-spec/api/chainSpec.html)
 */
export function useChainSpecData(options?: ChainHookOptions) {
  return useAtomValue(chainSpecDataAtom(useClient(options)));
}

/**
 * @internal
 */
export const chainSpecDataAtom = atomFamilyWithErrorCatcher(
  (client: PolkadotClient, withErrorCatcher) =>
    withErrorCatcher(atom)(() => client.getChainSpecData()),
);
