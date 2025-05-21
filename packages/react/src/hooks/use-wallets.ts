import { emptyArrayAtom } from "../constants/empty-array-atom.js";
import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import { atomWithObservable } from "../utils/jotai/atom-with-observable.js";
import { useAtomValue } from "./use-atom-value.js";
import { useConfig } from "./use-config.js";
import { useSsrValue } from "./use-ssr-value.js";
import type { Config } from "@reactive-dot/core";
import {
  aggregateWallets,
  getConnectedWallets,
} from "@reactive-dot/core/internal/actions.js";
import type { Wallet } from "@reactive-dot/core/wallets.js";
import { type Atom, atom } from "jotai";

/**
 * Hook for getting all available wallets.
 *
 * @group Hooks
 * @returns Available wallets
 */
export function useWallets() {
  return useAtomValue(
    useSsrValue<Atom<Wallet[] | Promise<Wallet[]>>>(
      walletsAtom(useConfig()),
      emptyArrayAtom,
    ),
  );
}

/**
 * Hook for getting all connected wallets.
 *
 * @group Hooks
 * @returns Connected wallets
 */
export function useConnectedWallets() {
  return useAtomValue(
    useSsrValue(connectedWalletsAtom(useConfig()), emptyArrayAtom),
  );
}

/**
 * @internal
 */
export const walletsAtom = atomFamilyWithErrorCatcher(
  (withErrorCatcher, config: Config) =>
    withErrorCatcher(atom(() => aggregateWallets(config.wallets ?? []))),
);

/**
 * @internal
 */
export const connectedWalletsAtom = atomFamilyWithErrorCatcher(
  (withErrorCatcher, config: Config) =>
    withErrorCatcher(
      atomWithObservable((get) =>
        getConnectedWallets(get(walletsAtom(config))),
      ),
    ),
);
