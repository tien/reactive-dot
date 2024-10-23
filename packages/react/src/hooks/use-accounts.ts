import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { chainSpecDataAtom } from "./use-chain-spec-data.js";
import { useConfig } from "./use-config.js";
import { connectedWalletsAtom } from "./use-wallets.js";
import { getAccounts, type ChainId, type Config } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import { atomWithObservable } from "jotai/utils";

/**
 * Hook for getting currently connected accounts.
 *
 * @param options - Additional options
 * @returns The currently connected accounts
 */
export function useAccounts(options?: ChainHookOptions) {
  return useAtomValue(
    accountsAtom({
      config: useConfig(),
      chainId: internal_useChainId({ ...options, optionalChainId: true }),
    }),
  );
}

/**
 * @internal
 */
export const accountsAtom = atomFamilyWithErrorCatcher(
  (param: { config: Config; chainId: ChainId | undefined }, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)((get) =>
      getAccounts(
        get(connectedWalletsAtom(param.config)),
        param.chainId === undefined
          ? undefined
          : get(
              chainSpecDataAtom(
                // @ts-expect-error `chainId` will never be undefined
                param,
              ),
            ),
      ),
    ),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
