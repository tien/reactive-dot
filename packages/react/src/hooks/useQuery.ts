import QueryBuilder, {
  InferQueryBuilder,
  QueryInstruction,
} from "../QueryBuilder.js";
import { compoundQueryAtomFamily } from "../stores/query.js";
import type { Falsy, FalsyGuard, FlatHead, ReDotDescriptor } from "../types.js";
import { flatHead, stringify } from "../utils.js";
import { atom, useAtomValue } from "jotai";
import { ChainDefinition } from "polkadot-api";
import { useMemo } from "react";

export const useQuery = <
  TQuery extends
    | ((
        builder: QueryBuilder<[], TDescriptor>,
      ) => QueryBuilder<QueryInstruction<TDescriptor>[], TDescriptor> | Falsy)
    | Falsy,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
>(
  builder: TQuery,
): TQuery extends false
  ? undefined
  : FalsyGuard<
      ReturnType<Exclude<TQuery, Falsy>>,
      FlatHead<
        InferQueryBuilder<Exclude<ReturnType<Exclude<TQuery, Falsy>>, Falsy>>
      >
    > => {
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
            : compoundQueryAtomFamily({ instructions: query.instructions }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [hashKey],
      ),
    ),
  );
};
