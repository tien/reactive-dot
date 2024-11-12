import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { chainSpecDataAtom } from "./use-chain-spec-data.js";
import { useMaybeClient } from "./use-client.js";
import { useConnectedWallets } from "./use-wallets.js";
import { getAccounts } from "@reactive-dot/core";
import type { Wallet } from "@reactive-dot/core/wallets.js";
import { useAtomValue } from "jotai";
import { atomWithObservable } from "jotai/utils";
import type { PolkadotClient } from "polkadot-api";

/**
 * Hook for getting currently connected accounts.
 *
 * @param options - Additional options
 * @returns The currently connected accounts
 */
export function useAccounts(options?: ChainHookOptions) {
  return useAtomValue(
    accountsAtom({
      wallets: useConnectedWallets(),
      client: useMaybeClient(options),
    }),
  );
}

/**
 * @internal
 */
export const accountsAtom = atomFamilyWithErrorCatcher(
  (
    param: { wallets: readonly Wallet[]; client: PolkadotClient | undefined },
    withErrorCatcher,
  ) =>
    withErrorCatcher(atomWithObservable)((get) =>
      getAccounts(
        param.wallets,
        param.client === undefined
          ? undefined
          : get(chainSpecDataAtom(param.client)),
      ),
    ),
  (a, b) => a.wallets === b.wallets && a.client === b.client,
);
