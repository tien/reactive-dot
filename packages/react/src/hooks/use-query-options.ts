import { ChainIdContext } from "../contexts/chain.js";
import type { QueryArgument, ChainHookOptions, QueryOptions } from "./types.js";
import { type ChainId, Query, ReactiveDotError } from "@reactive-dot/core";
import { use, useMemo } from "react";

/**
 * @internal
 */
export function useQueryOptions<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
>(
  query: TQuery,
  options?: ChainHookOptions<TChainId>,
): Array<{
  chainId: ChainId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: Query<any[], any> | undefined;
}>;
/**
 * @internal
 */
export function useQueryOptions<
  TChainIds extends Array<ChainId | undefined>,
  const TOptions extends {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
>(
  options: TOptions & {
    [P in keyof TChainIds]: QueryOptions<TChainIds[P]>;
  },
): Array<{
  chainId: ChainId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: Query<any[], any> | undefined;
}>;
/**
 * @internal
 */
export function useQueryOptions(
  queryOrOptions: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | QueryArgument<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | Array<ChainHookOptions<any> & { query: QueryArgument<any> }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mayBeOptions?: ChainHookOptions<any>,
) {
  const contextChainId = use(ChainIdContext);

  return useMemo(
    () =>
      (Array.isArray(queryOrOptions)
        ? queryOrOptions
        : [{ query: queryOrOptions, ...mayBeOptions }]
      ).map((options) => {
        const chainId = options.chainId ?? contextChainId;

        if (chainId === undefined) {
          throw new ReactiveDotError("No chain ID provided");
        }

        return {
          chainId,
          query:
            options.query instanceof Query
              ? options.query
              : typeof options.query === "function"
                ? options.query(new Query()) || undefined
                : undefined,
        };
      }),
    [contextChainId, mayBeOptions, queryOrOptions],
  );
}
