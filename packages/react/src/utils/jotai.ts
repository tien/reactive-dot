import { QueryError } from "@reactive-dot/core";
import type { Atom, Getter } from "jotai";
import { atomFamily } from "jotai/utils";
import type { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

export class AtomFamilyError extends QueryError {
  constructor(
    readonly atomFamily: AtomFamily<unknown, unknown>,
    readonly param: unknown,
    message: string | undefined,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromAtomFamilyError<TError, TAtomFamily extends AtomFamily<any, any>>(
    error: TError,
    atomFamily: TAtomFamily,
    param: TAtomFamily extends AtomFamily<infer Param, infer _>
      ? Param
      : unknown,
    message?: string,
  ) {
    return new this(atomFamily, param, message, {
      cause: error,
    });
  }
}

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
          try {
            const value = read(...readArgs);

            if (value instanceof Promise) {
              return value.catch((error) => {
                throw AtomFamilyError.fromAtomFamilyError(
                  error,
                  baseAtomFamily,
                  param,
                );
              });
            }

            if (value instanceof Observable) {
              return value.pipe(
                catchError((error) => {
                  throw AtomFamilyError.fromAtomFamilyError(
                    error,
                    baseAtomFamily,
                    param,
                  );
                }),
              );
            }

            return value;
          } catch (error) {
            throw AtomFamilyError.fromAtomFamilyError(
              error,
              baseAtomFamily,
              param,
            );
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

export function resetQueryError(error: unknown) {
  if (!(error instanceof Error)) {
    return;
  }

  if (error instanceof AtomFamilyError) {
    error.atomFamily.remove(error.param);
  }

  if (error.cause instanceof Error) {
    resetQueryError(error.cause);
  }
}
