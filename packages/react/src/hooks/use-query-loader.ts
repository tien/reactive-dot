import type { ChainHookOptions } from "./types.js";
import { clientAtom } from "./use-client.js";
import { useConfig } from "./use-config.js";
import { useDescriptor } from "./use-descriptor.js";
import { queryPayloadAtom } from "./use-query.js";
import { typedApiAtom, useTypedApi } from "./use-typed-api.js";
import { type ChainId, Query } from "@reactive-dot/core";
import type {
  ChainDescriptorOf,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import type { Getter } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback } from "react";

/**
 * Hook for loading queries without suspending.
 *
 * @returns The function to load queries
 */
export function useQueryLoader() {
  const config = useConfig();
  const typedApi = useTypedApi();
  const descriptor = useDescriptor();

  const _loadQuery = useCallback(
    (get: Getter) =>
      async <
        TChainId extends ChainId | undefined,
        TQuery extends (
          builder: Query<[], ChainDescriptorOf<TChainId>>,
        ) => Query<
          QueryInstruction<ChainDescriptorOf<TChainId>>[],
          ChainDescriptorOf<TChainId>
        >,
      >(
        builder: TQuery,
        options?: ChainHookOptions<TChainId>,
      ) => {
        const query = builder(new Query([]));

        const api =
          options?.chainId !== undefined
            ? get(
                typedApiAtom({
                  client: await get(
                    clientAtom({ config, chainId: options.chainId }),
                  ),
                  descriptor,
                }),
              )
            : typedApi;

        void get(
          queryPayloadAtom({
            api,
            query,
          }),
        );
      },
    [config, descriptor, typedApi],
  );

  const loadQuery = useAtomCallback(
    useCallback(
      (
        get,
        _,
        builder: <TChainId extends ChainId | undefined>(
          query: Query<[], ChainDescriptorOf<TChainId>>,
          options?: ChainHookOptions<TChainId>,
        ) => Query<[]>,
      ) => _loadQuery(get)(builder),
      [_loadQuery],
    ),
  );

  return loadQuery as ReturnType<typeof _loadQuery>;
}
