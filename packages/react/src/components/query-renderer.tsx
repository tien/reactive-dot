import { useLazyLoadQuery } from "../hooks/use-query.js";
import type { ChainId, idle, Query } from "@reactive-dot/core";
import type {
  ChainDescriptorOf,
  Falsy,
  FalsyGuard,
  FlatHead,
  InferQueryPayload,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import type { ReactNode } from "react";

type QueryRendererProps<
  TChainId extends ChainId | undefined,
  TQuery extends
    | ((
        builder: Query<[], ChainDescriptorOf<TChainId>>,
      ) =>
        | Query<
            QueryInstruction<ChainDescriptorOf<TChainId>>[],
            ChainDescriptorOf<TChainId>
          >
        | Falsy)
    | Falsy,
> = {
  query: TQuery;
  chainId?: TChainId;
  children: (
    result: TQuery extends Falsy
      ? typeof idle
      : FalsyGuard<
          ReturnType<Exclude<TQuery, Falsy>>,
          FlatHead<
            InferQueryPayload<
              Exclude<ReturnType<Exclude<TQuery, Falsy>>, Falsy>
            >
          >,
          typeof idle
        >,
  ) => ReactNode;
};

/**
 * Component for rendering the result of a query.
 *
 * @experimental
 */
export function QueryRenderer<
  TChainId extends ChainId | undefined,
  TQuery extends
    | ((
        builder: Query<[], ChainDescriptorOf<TChainId>>,
      ) =>
        | Query<
            QueryInstruction<ChainDescriptorOf<TChainId>>[],
            ChainDescriptorOf<TChainId>
          >
        | Falsy)
    | Falsy,
>({ query, chainId, children }: QueryRendererProps<TChainId, TQuery>) {
  return children(useLazyLoadQuery(query, { chainId }));
}
