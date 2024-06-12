import { stringify } from "../utils.js";
import { typedApiAtomFamily } from "./client.js";
import {
  MultiInstruction,
  QueryError,
  QueryInstruction,
  preflight,
  query,
} from "@reactive-dot/core";
import type { ChainId } from "@reactive-dot/types";
import { atom } from "jotai";
import { atomFamily, atomWithObservable } from "jotai/utils";
import { from, switchMap, type Observable } from "rxjs";

const _queryAtomFamily = atomFamily(
  (param: {
    chainId: ChainId;
    instruction: Exclude<
      QueryInstruction,
      MultiInstruction<// @ts-expect-error need any empty object here
      // eslint-disable-next-line @typescript-eslint/ban-types
      {}>
    >;
  }) => {
    switch (preflight(param.instruction)) {
      case "promise":
        return atom(async (get, { signal }) => {
          const api = await get(typedApiAtomFamily(param.chainId));

          return query(api, param.instruction, { signal }) as Promise<unknown>;
        });
      case "observable":
        return atomWithObservable((get) =>
          from(get(typedApiAtomFamily(param.chainId))).pipe(
            switchMap(
              (api) => query(api, param.instruction) as Observable<unknown>,
            ),
          ),
        );
    }
  },
  (a, b) => stringify(a) === stringify(b),
);

export const queryAtomFamily = (param: {
  chainId: ChainId;
  instruction: QueryInstruction;
}) =>
  atom((get) => {
    if (param.chainId === undefined) {
      throw new QueryError("No chain Id provided");
    }

    if (!("multi" in param.instruction)) {
      return get(_queryAtomFamily({ ...param, chainId: param.chainId }));
    }

    const { multi: _, ...query } = param.instruction;

    return Promise.all(
      param.instruction.args.map((args: unknown[]) =>
        get(
          _queryAtomFamily({
            chainId: param.chainId,
            instruction: { ...query, args },
          }),
        ),
      ),
    );
  });

// TODO: should be memoized within render function instead
// https://github.com/pmndrs/jotai/discussions/1553
export const compoundQueryAtomFamily = atomFamily(
  (param: { chainId: ChainId; instructions: readonly QueryInstruction[] }) =>
    atom((get) =>
      Promise.all(
        param.instructions.map((instruction) =>
          get(
            queryAtomFamily({
              ...param,
              instruction,
            }),
          ),
        ),
      ),
    ),
  (a, b) => stringify(a) === stringify(b),
);
