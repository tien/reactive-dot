import { stringify } from "../utils.js";
import { typedApiAtomFamily } from "./client.js";
import {
  type MultiInstruction,
  type Query,
  QueryError,
  QueryInstruction,
  preflight,
  query,
} from "@reactive-dot/core";
import type { ChainId } from "@reactive-dot/types";
import { atom } from "jotai";
import { atomFamily, atomWithObservable } from "jotai/utils";
import { from, switchMap, type Observable } from "rxjs";

const instructionPayloadAtomFamily = atomFamily(
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

// TODO: should be memoized within render function instead
// https://github.com/pmndrs/jotai/discussions/1553
export const queryPayloadAtomFamily = atomFamily(
  (param: { chainId: ChainId; query: Query }) =>
    atom((get) =>
      Promise.all(
        param.query.instructions.map((instruction) => {
          if (param.chainId === undefined) {
            throw new QueryError("No chain Id provided");
          }

          if (!("multi" in instruction)) {
            return get(
              instructionPayloadAtomFamily({
                chainId: param.chainId,
                instruction,
              }),
            );
          }

          const { multi: _, ...query } = instruction;

          return Promise.all(
            instruction.args.map((args: unknown[]) =>
              get(
                instructionPayloadAtomFamily({
                  chainId: param.chainId,
                  instruction: { ...query, args },
                }),
              ),
            ),
          );
        }),
      ),
    ),
  (a, b) =>
    a.chainId === b.chainId &&
    stringify(a.query.instructions) === stringify(b.query.instructions),
);
