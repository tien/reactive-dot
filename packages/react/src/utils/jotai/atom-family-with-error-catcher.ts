import { type AtomFamily, atomFamily } from "./atom-family.js";
import { type Atom, atom, type Getter, type WritableAtom } from "jotai";

export const atomFamilyErrorsAtom = atom(
  () =>
    new Set<{
      atomFamily: AtomFamily<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any[],
        unknown
      >;
      args: unknown;
    }>(),
);

export function atomFamilyWithErrorCatcher<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArguments extends any[],
  TCached,
>(
  initializeAtom: (
    withErrorCatcher: <TAtomType extends Atom<unknown>>(
      atom: TAtomType,
    ) => TAtomType,
    ...args: TArguments
  ) => TCached,
  getKey?: (...args: TArguments) => unknown,
): AtomFamily<TArguments, TCached> {
  const baseAtomFamily = atomFamily((...args: TArguments) => {
    const withErrorCatcher = <TAtomType extends Atom<unknown>>(
      childAtom: TAtomType,
    ) => {
      const read = (get: Getter) => {
        try {
          const value = get(childAtom);

          if (!(value instanceof Promise)) {
            return value;
          }

          return value.catch((error) => {
            get(atomFamilyErrorsAtom).add({
              atomFamily: baseAtomFamily,
              args,
            });

            throw error;
          });
        } catch (error) {
          get(atomFamilyErrorsAtom).add({
            atomFamily: baseAtomFamily,
            args,
          });

          throw error;
        }
      };

      return "write" in childAtom
        ? atom(read, (_, set, ...args: unknown[]) =>
            set(
              childAtom as unknown as WritableAtom<unknown, unknown[], unknown>,
              ...args,
            ),
          )
        : atom(read);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return initializeAtom(withErrorCatcher as any, ...args);
  }, getKey);

  return baseAtomFamily;
}
