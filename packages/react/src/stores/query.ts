import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import { typedApiAtom } from "./client.js";
import {
  preflight,
  query,
  type ChainId,
  type Config,
  type Query,
} from "@reactive-dot/core";
import {
  stringify,
  type MultiInstruction,
  type QueryInstruction,
} from "@reactive-dot/core/internal.js";
import { atom, type Atom, type WritableAtom } from "jotai";
import { atomWithObservable, atomWithRefresh } from "jotai/utils";
import { from, switchMap, type Observable } from "rxjs";

export const instructionPayloadAtom = atomFamilyWithErrorCatcher(
  (
    param: {
      config: Config;
      chainId: ChainId;
      instruction: Exclude<
        QueryInstruction,
        MultiInstruction<// @ts-expect-error need any empty object here
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        {}>
      >;
    },
    withErrorCatcher,
  ): Atom<unknown> | WritableAtom<Promise<unknown>, [], void> => {
    switch (preflight(param.instruction)) {
      case "promise":
        return withErrorCatcher(atomWithRefresh)(async (get, { signal }) => {
          const api = await get(typedApiAtom(param));

          return query(api, param.instruction, { signal });
        });
      case "observable":
        return withErrorCatcher(atomWithObservable)((get) =>
          from(get(typedApiAtom(param))).pipe(
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
      return instructionPayloadAtom({
        config,
        chainId,
        instruction,
      });
    }

    return (instruction.args as unknown[]).map((args) => {
      const { multi, ...rest } = instruction;

      return instructionPayloadAtom({
        config,
        chainId,
        instruction: { ...rest, args },
      });
    });
  });
}

// TODO: should be memoized within render function instead
// https://github.com/pmndrs/jotai/discussions/1553
export const queryPayloadAtom = atomFamilyWithErrorCatcher(
  (
    param: { config: Config; chainId: ChainId; query: Query },
    withErrorCatcher,
  ): Atom<unknown> =>
    withErrorCatcher(atom)((get) => {
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
