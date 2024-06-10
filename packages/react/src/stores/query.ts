import { stringify } from "../utils.js";
import { typedApiAtomFamily } from "./client.js";
import {
  QueryInstruction,
  MultiInstruction,
  QueryError,
} from "@reactive-dot/core";
import type { ChainId } from "@reactive-dot/types";
import { atom } from "jotai";
import { atomFamily, atomWithObservable } from "jotai/utils";
import { from, type Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

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
    switch (param.instruction.instruction) {
      case "fetch-constant": {
        const { pallet, constant } = param.instruction;

        return atom(async (get) => {
          const api = await get(typedApiAtomFamily(param.chainId));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (api as any).constants[pallet][constant]() as Promise<unknown>;
        });
      }

      case "read-storage": {
        const { pallet, storage, args } = param.instruction;

        return atomWithObservable((get) =>
          from(get(typedApiAtomFamily(param.chainId))).pipe(
            switchMap(
              (api) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (api as any).query[pallet][storage].watchValue(
                  ...args,
                ) as Observable<unknown>,
            ),
          ),
        );
      }

      case "read-storage-entries": {
        const { pallet, storage, args } = param.instruction;

        return atom(async (get, { signal }) => {
          const api = await get(typedApiAtomFamily(param.chainId));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (api as any).query[pallet][storage].getEntries(...args, {
            signal,
          });
        });
      }

      case "call-api": {
        const { pallet, api, args } = param.instruction;

        return atom(async (get, { signal }) => {
          const typedApi = await get(typedApiAtomFamily(param.chainId));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (typedApi as any).apis[pallet][api](...args, {
            signal,
          }) as Promise<unknown>;
        });
      }
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
