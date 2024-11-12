import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import type { ChainHookOptions } from "./types.js";
import { useClient } from "./use-client.js";
import { getBlock } from "@reactive-dot/core";
import { useAtomValue } from "jotai";
import { atomWithObservable } from "jotai/utils";
import type { PolkadotClient } from "polkadot-api";

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
  const client = useClient(options);

  return useAtomValue(
    tag === "finalized" ? finalizedBlockAtom(client) : bestBlockAtom(client),
  );
}

/**
 * @internal
 */
export const finalizedBlockAtom = atomFamilyWithErrorCatcher(
  (client: PolkadotClient, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)(() =>
      getBlock(client, { tag: "finalized" }),
    ),
);

/**
 * @internal
 */
export const bestBlockAtom = atomFamilyWithErrorCatcher(
  (client: PolkadotClient, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)(() =>
      getBlock(client, { tag: "best" }),
    ),
);
