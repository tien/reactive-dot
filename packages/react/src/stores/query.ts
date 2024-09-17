import { withAtomFamilyErrorCatcher } from "../utils/jotai.js";
import { stringify } from "../utils/vanilla.js";
import { typedApiAtomFamily } from "./client.js";
import {
  type Config,
  preflight,
  query,
  type ChainId,
  type Query,
} from "@reactive-dot/core";
import type {
  MultiInstruction,
  QueryInstruction,
} from "@reactive-dot/core/internal.js";
import { atom, type Atom, type WritableAtom } from "jotai";
import { atomFamily, atomWithObservable, atomWithRefresh } from "jotai/utils";
import { from, switchMap, type Observable } from "rxjs";

export const instructionPayloadAtomFamily = atomFamily(
  (param: {
    config: Config;
    chainId: ChainId;
    instruction: Exclude<
      QueryInstruction,
      MultiInstruction<// @ts-expect-error need any empty object here
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      {}>
    >;
  }): Atom<unknown> | WritableAtom<Promise<unknown>, [], void> => {
    switch (preflight(param.instruction)) {
      case "promise":
        return withAtomFamilyErrorCatcher(
          instructionPayloadAtomFamily,
          param,
          atomWithRefresh,
        )(async (get, { signal }) => {
          const api = await get(typedApiAtomFamily(param));

          return query(api, param.instruction, { signal });
        });
      case "observable":
        return withAtomFamilyErrorCatcher(
          instructionPayloadAtomFamily,
          param,
          atomWithObservable,
        )((get) =>
          from(get(typedApiAtomFamily(param))).pipe(
            switchMap(
              (api) => query(api, param.instruction) as Observable<unknown>,
            ),
          ),
        );
    }
  },
  (a, b) =>
    a.config === b.config &&
    a.chainId === b.chainId &&
    stringify(a.instruction) === stringify(b.instruction),
);

export function getQueryInstructionPayloadAtoms(
  config: Config,
  chainId: ChainId,
  query: Query,
) {
  return query.instructions.map((instruction) => {
    if (!("multi" in instruction)) {
      return instructionPayloadAtomFamily({
        config,
        chainId,
        instruction,
      });
    }

    return (instruction.args as unknown[]).map((args) => {
      const { multi, ...rest } = instruction;

      return instructionPayloadAtomFamily({
        config,
        chainId,
        instruction: { ...rest, args },
      });
    });
  });
}

// TODO: should be memoized within render function instead
// https://github.com/pmndrs/jotai/discussions/1553
export const queryPayloadAtomFamily = atomFamily(
  (param: { config: Config; chainId: ChainId; query: Query }): Atom<unknown> =>
    withAtomFamilyErrorCatcher(
      queryPayloadAtomFamily,
      param,
      atom,
    )((get) => {
      const atoms = getQueryInstructionPayloadAtoms(
        param.config,
        param.chainId,
        param.query,
      );

      return Promise.all(
        atoms.map((atomOrAtoms) => {
          if (Array.isArray(atomOrAtoms)) {
            return Promise.all(atomOrAtoms.map(get));
          }

          return get(atomOrAtoms);
        }),
      );
    }),
  (a, b) =>
    a.config === b.config &&
    a.chainId === b.chainId &&
    stringify(a.query.instructions) === stringify(b.query.instructions),
);
