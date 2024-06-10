import { ChainIdContext } from "../context.js";
import { compoundQueryAtomFamily } from "../stores/query.js";
import type { Falsy, FalsyGuard, FlatHead } from "../types.js";
import { flatHead, stringify } from "../utils.js";
import {
  InferQueryBuilder,
  QueryBuilder,
  QueryError,
  QueryInstruction,
} from "@reactive-dot/core";
import type { ChainId, Chains, ReDotDescriptor } from "@reactive-dot/types";
import { atom, useAtomValue } from "jotai";
import { useContext, useMemo } from "react";

export const useQuery = <
  TQuery extends
    | ((
        builder: QueryBuilder<[], TDescriptor>,
      ) => QueryBuilder<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy,
  TDescriptor extends TChainId extends void
    ? ReDotDescriptor
    : Chains[Exclude<TChainId, void>],
  TChainId extends ChainId | void = void,
>(
  builder: TQuery,
  options?: { chainId?: TChainId },
): TQuery extends false
  ? undefined
  : FalsyGuard<
      ReturnType<Exclude<TQuery, Falsy>>,
      FlatHead<
        InferQueryBuilder<Exclude<ReturnType<Exclude<TQuery, Falsy>>, Falsy>>
      >
    > => {
  const contextChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (chainId === undefined) {
    throw new QueryError("No chain ID provided");
  }

  const query = useMemo(
    () => (!builder ? undefined : builder(new QueryBuilder([]))),
    [builder],
  );

  const hashKey = useMemo(
    () => (!query ? query : stringify(query.instructions)),
    [query],
  );

  // @ts-expect-error complex type
  return flatHead(
    useAtomValue(
      useMemo(
        () =>
          !query
            ? atom(undefined)
            : compoundQueryAtomFamily({
                chainId,
                instructions: query.instructions,
              }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [hashKey],
      ),
    ),
  );
};
