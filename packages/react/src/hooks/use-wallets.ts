import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import { useConfig } from "./use-config.js";
import {
  aggregateWallets,
  type Config,
  getConnectedWallets,
} from "@reactive-dot/core";
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

/**
 * @internal
 */
export const walletsAtom = atomFamilyWithErrorCatcher(
  (config: Config, withErrorCatcher) =>
    withErrorCatcher(atom)(() => aggregateWallets(config.wallets ?? [])),
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
