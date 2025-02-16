import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import { useConfig } from "./use-config.js";
import type { Config } from "@reactive-dot/core";
import {
  aggregateWallets,
  getConnectedWallets,
} from "@reactive-dot/core/internal/actions.js";
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
  (withErrorCatcher, config: Config) =>
    withErrorCatcher(atom)(() => aggregateWallets(config.wallets ?? [])),
);

/**
 * @internal
 */
export const connectedWalletsAtom = atomFamilyWithErrorCatcher(
  (withErrorCatcher, config: Config) =>
    withErrorCatcher(atomWithObservable)((get) =>
      getConnectedWallets(get(walletsAtom(config))),
    ),
);
