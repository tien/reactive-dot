import { withAtomFamilyErrorCatcher } from "../utils/jotai.js";
import { stringify } from "../utils/vanilla.js";
import { typedApiAtomFamily } from "./client.js";
import {
  preflight,
  query,
  type ChainId,
  type MultiInstruction,
  type Query,
  type QueryInstruction,
} from "@reactive-dot/core";
import { atom, type Atom, type WritableAtom } from "jotai";
import { atomFamily, atomWithObservable, atomWithRefresh } from "jotai/utils";
import { from, switchMap, type Observable } from "rxjs";

export const instructionPayloadAtomFamily = atomFamily(
  (param: {
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
          const api = await get(typedApiAtomFamily(param.chainId));

          return query(api, param.instruction, { signal });
        });
      case "observable":
        return withAtomFamilyErrorCatcher(
          instructionPayloadAtomFamily,
          param,
          atomWithObservable,
        )((get) =>
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

export function getQueryInstructionPayloadAtoms(
  chainId: ChainId,
  query: Query,
) {
  return query.instructions.map((instruction) => {
    if (!("multi" in instruction)) {
      return instructionPayloadAtomFamily({
        chainId: chainId,
        instruction,
      });
    }

    return (instruction.args as unknown[]).map((args) => {
      const { multi, ...rest } = instruction;

      return instructionPayloadAtomFamily({
        chainId: chainId,
        instruction: { ...rest, args },
      });
    });
  });
}

// TODO: should be memoized within render function instead
// https://github.com/pmndrs/jotai/discussions/1553
export const queryPayloadAtomFamily = atomFamily(
  (param: { chainId: ChainId; query: Query }): Atom<unknown> =>
    withAtomFamilyErrorCatcher(
      queryPayloadAtomFamily,
      param,
      atom,
    )((get) => {
      const atoms = getQueryInstructionPayloadAtoms(param.chainId, param.query);

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
    a.chainId === b.chainId &&
    stringify(a.query.instructions) === stringify(b.query.instructions),
);
