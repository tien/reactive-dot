import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import { useConfig } from "./use-config.js";
import {
  aggregateWallets,
  type Config,
  getConnectedWallets,
} from "@reactive-dot/core";
import { Wallet, WalletProvider } from "@reactive-dot/core/wallets.js";
import { atom, useAtomValue } from "jotai";
import { atomWithObservable } from "jotai/utils";

/**
 * Hook for getting all available wallets.
 *
 * @returns Available wallets
 */
export function useWallets() {
  return useAtomValue(walletsAtom(useConfig()));
}

/**
 * Hook for getting all connected wallets.
 *
 * @returns Connected wallets
 */
export function useConnectedWallets() {
  return useAtomValue(connectedWalletsAtom(useConfig()));
}

const providerWalletsAtom = atomFamilyWithErrorCatcher(
  (config: Config, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)(() =>
      aggregateWallets(
        config.wallets?.filter(
          (walletOrProvider) => walletOrProvider instanceof WalletProvider,
        ) ?? [],
      ),
    ),
);

/**
 * @internal
 */
export const walletsAtom = atomFamilyWithErrorCatcher(
  (config: Config, withErrorCatcher) =>
    withErrorCatcher(atom)(async (get) => [
      ...(config.wallets?.filter(
        (walletOrProvider) => walletOrProvider instanceof Wallet,
      ) ?? []),
      ...(await get(providerWalletsAtom(config))),
    ]),
);

/**
 * @internal
 */
export const connectedWalletsAtom = atomFamilyWithErrorCatcher(
  (config: Config, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)((get) =>
      getConnectedWallets(get(walletsAtom(config))),
    ),
);
