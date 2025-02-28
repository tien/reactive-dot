import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import { atomWithObservableAndPromise } from "../utils/jotai/atom-with-observable-and-promise.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { clientAtom } from "./use-client.js";
import { useConfig } from "./use-config.js";
import { usePausableAtomValue } from "./use-pausable-atom-value.js";
import { type ChainId, type Config } from "@reactive-dot/core";
import { getBlock } from "@reactive-dot/core/internal/actions.js";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";

/**
 * Hook for fetching information about the latest block.
 *
 * @param tag - Which block to target
 * @param options - Additional options
 * @returns The latest finalized or best block
 */
export function useBlock(
  tag: "best" | "finalized" = "finalized",
  options?: ChainHookOptions,
) {
  const config = useConfig();
  const chainId = internal_useChainId(options);

  return usePausableAtomValue(
    tag === "finalized"
      ? finalizedBlockAtom(config, chainId)
      : bestBlockAtom(config, chainId),
  );
}

/**
 * @internal
 */
export const finalizedBlockAtom = atomFamilyWithErrorCatcher(
  (withErrorCatcher, config: Config, chainId: ChainId) =>
    atomWithObservableAndPromise(
      (get) =>
        from(get(clientAtom(config, chainId))).pipe(
          switchMap((client) => getBlock(client, { tag: "finalized" })),
        ),
      withErrorCatcher,
    ),
);

/**
 * @internal
 */
export const bestBlockAtom = atomFamilyWithErrorCatcher(
  (withErrorCatcher, config: Config, chainId: ChainId) =>
    atomWithObservableAndPromise(
      (get) =>
        from(get(clientAtom(config, chainId))).pipe(
          switchMap((client) => getBlock(client, { tag: "best" })),
        ),
      withErrorCatcher,
    ),
);
