import type { ChainHookOptions, QueryArgument, QueryOptions } from "./types.js";
import { useConfig } from "./use-config.js";
import { useQueryOptions } from "./use-query-options.js";
import { getQueryInstructionPayloadAtoms } from "./use-query.js";
import { type ChainId } from "@reactive-dot/core";
import type { WritableAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for refreshing cached query.
 *
 * @param query - The function to create the query
 * @param options - Additional options
 * @returns The function to refresh the query
 */
export function useQueryRefresher<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
>(query: TQuery, options?: ChainHookOptions<TChainId>): () => void;
/**
 * Hook for refreshing cached query.
 *
 * @param options - The query options
 * @returns The function to refresh the query
 */
export function useQueryRefresher<
  TChainIds extends Array<ChainId | undefined>,
  const TOptions extends {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
>(
  options: TOptions & {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
): () => void;
/**
 * Hook for refreshing cached query.
 *
 * @param query - The function to create the query
 * @param options - Additional options
 * @returns The function to refresh the query
 */
export function useQueryRefresher(
  queryOrOptions: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | QueryArgument<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | Array<ChainHookOptions<any> & { query: QueryArgument<any> }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mayBeOptions?: ChainHookOptions<any>,
) {
  const options = useQueryOptions(
    // @ts-expect-error complex overload
    queryOrOptions,
    mayBeOptions,
  );

  const config = useConfig();

  const refresh = useAtomCallback(
    useCallback(
      (_, set) => {
        for (const { chainId, query } of options) {
          if (query === undefined) {
            return;
          }

          const atoms = getQueryInstructionPayloadAtoms(
            config,
            chainId,
            query,
          ).flat();

          for (const atom of atoms) {
            if ("write" in atom.promiseAtom) {
              set(
                atom.promiseAtom as WritableAtom<unknown, unknown[], unknown>,
              );
            }
          }
        }
      },
      [config, options],
    ),
  );

  return refresh;
}
