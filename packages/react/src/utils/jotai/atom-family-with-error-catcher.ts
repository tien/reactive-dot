import { type AtomFamily, atomFamily } from "./atom-family.js";
import { atom, type Getter } from "jotai";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

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
  TAtomType,
>(
  initializeAtom: (
    withErrorCatcher: <TAtomCreator>(atomCreator: TAtomCreator) => TAtomCreator,
    ...args: TArguments
  ) => TAtomType,
  getKey?: (...args: TArguments) => unknown,
): AtomFamily<TArguments, TAtomType> {
  const baseAtomFamily = atomFamily((...args: TArguments) => {
    const withErrorCatcher: <
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      TRead extends (get: Getter, ...args: unknown[]) => any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      TAtomCreator extends (read: TRead, ...args: any[]) => unknown,
    >(
      atomCreator: TAtomCreator,
    ) => TAtomCreator = (atomCreator) => {
      // @ts-expect-error complex sub-type
      const atomCatching: TAtomCreator = (read, ...args) => {
        // @ts-expect-error complex sub-type
        const readCatching: TRead = (...readArgs) => {
          const addError = <T>(error: T) => {
            const get = readArgs[0] as Getter;
            get(atomFamilyErrorsAtom).add({
              atomFamily: baseAtomFamily,
              args,
            });
            return error;
          };

          try {
            const value = read(...readArgs);

            if (value instanceof Promise) {
              return value.catch((error) => {
                throw addError(error);
              });
            }

            if (value instanceof Observable) {
              return value.pipe(
                catchError((error) => {
                  throw addError(error);
                }),
              );
            }

            return value;
          } catch (error) {
            throw addError(error);
          }
        };

        return atomCreator(readCatching, ...args);
      };

      return atomCatching;
    };

    return initializeAtom(
      // @ts-expect-error complex type
      withErrorCatcher,
      ...args,
    );
  }, getKey);

  return baseAtomFamily;
}
