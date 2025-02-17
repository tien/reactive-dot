import type {
  InferQueryArgumentResult,
  QueryArgument,
} from "../hooks/types.js";
import { useLazyLoadQuery } from "../hooks/use-query.js";
import type { ChainId } from "@reactive-dot/core";
import type { ReactNode } from "react";

type QueryRendererProps<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
> = {
  query: TQuery;
  chainId?: TChainId;
  children: (result: InferQueryArgumentResult<TChainId, TQuery>) => ReactNode;
};

/**
 * Component for rendering the result of a query.
 *
 * @experimental
 */
export function QueryRenderer<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
>({ query, chainId, children }: QueryRendererProps<TChainId, TQuery>) {
  return children(useLazyLoadQuery(query, { chainId }));
}
