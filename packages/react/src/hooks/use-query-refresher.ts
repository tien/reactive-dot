import { getQueryInstructionPayloadAtoms } from "../stores/query.js";
import type { ChainHookOptions } from "./types.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import {
  Query,
  type ChainId,
  type Chains,
  type CommonDescriptor,
} from "@reactive-dot/core";
import type { Falsy, QueryInstruction } from "@reactive-dot/core/internal.js";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for refreshing cached query.
 *
 * @param builder - The function to create the query
 * @param options - Additional options
 * @returns The function to refresh the query
 */
export function useQueryRefresher<
  TQuery extends
    | ((
        builder: Query<[], TDescriptor>,
      ) => Query<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy,
  TDescriptor extends TChainId extends void
    ? CommonDescriptor
    : Chains[TChainId],
  TChainId extends ChainId,
>(builder: TQuery, options?: ChainHookOptions<TChainId>) {
  const config = useConfig();
  const chainId = internal_useChainId(options);

  const refresh = useAtomCallback(
    useCallback(
      (_, set) => {
        if (!builder) {
          return;
        }

        const query = builder(new Query([]));

        if (!query) {
          return;
        }

        const atoms = getQueryInstructionPayloadAtoms(
          config,
          chainId,
          query,
        ).flat();

        for (const atom of atoms) {
          if ("write" in atom) {
            set(atom);
          }
        }
      },
      [builder, chainId, config],
    ),
  );

  return refresh;
}
