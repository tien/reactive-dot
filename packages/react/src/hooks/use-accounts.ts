import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { chainSpecDataAtom } from "./use-chain-spec-data.js";
import { useConfig } from "./use-config.js";
import { connectedWalletsAtom } from "./use-wallets.js";
import { type ChainId, type Config } from "@reactive-dot/core";
import { getAccounts } from "@reactive-dot/core/internal/actions.js";
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
    accountsAtom(
      useConfig(),
      internal_useChainId({ ...options, optionalChainId: true }),
    ),
  );
}

/**
 * @internal
 */
export const accountsAtom = atomFamilyWithErrorCatcher(
  (withErrorCatcher, config: Config, chainId: ChainId | undefined) =>
    withErrorCatcher(atomWithObservable)((get) =>
      getAccounts(
        get(connectedWalletsAtom(config)),
        chainId === undefined
          ? undefined
          : get(chainSpecDataAtom(config, chainId)),
      ),
    ),
);
