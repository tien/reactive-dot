import { atom, type Atom, type Getter } from "jotai";
import { atomFamily } from "jotai/utils";
import type { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

export const atomFamilyErrorsAtom = atom(
  () =>
    new Set<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      atomFamily: AtomFamily<any, any>;
      param: unknown;
    }>(),
);

export function atomFamilyWithErrorCatcher<
  TParam,
  TAtomType extends Atom<unknown>,
  TWithErrorCatcher extends <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TRead extends (get: Getter, ...args: unknown[]) => any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TAtomCreator extends (read: TRead, ...args: any[]) => Atom<unknown>,
  >(
    atomCreator: TAtomCreator,
  ) => TAtomCreator,
>(
  initializeAtom: (
    param: TParam,
    withErrorCatcher: TWithErrorCatcher,
  ) => TAtomType,
  areEqual?: (a: TParam, b: TParam) => boolean,
): AtomFamily<TParam, TAtomType> {
  const baseAtomFamily = atomFamily((param: TParam) => {
    // @ts-expect-error complex sub-type
    const withErrorCatcher: TWithErrorCatcher = (atomCreator) => {
      // @ts-expect-error complex sub-type
      const atomCatching: TAtomCreator = (read, ...args) => {
        // @ts-expect-error complex sub-type
        const readCatching: TRead = (...readArgs) => {
          const addError = <T>(error: T) => {
            const get = readArgs[0] as Getter;
            get(atomFamilyErrorsAtom).add({
              atomFamily: baseAtomFamily,
              param,
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

    return initializeAtom(param, withErrorCatcher);
  }, areEqual);

  return baseAtomFamily;
}
