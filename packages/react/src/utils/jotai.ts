import { QueryError } from "@reactive-dot/core";
import type { Atom, Getter } from "jotai";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

type WeakAtomFamily<TParam, TAtomType> = ((param: TParam) => TAtomType) & {
  remove: (param: TParam) => void;
};

export function weakAtomFamily<TParam, TAtomType extends Atom<unknown>>(
  initializeAtom: (param: TParam) => TAtomType,
  areEqual?: (a: TParam, b: TParam) => boolean,
): WeakAtomFamily<TParam, TAtomType> {
  // TODO: should use `Symbol` as `WeakMap` key instead
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1710433
  const keys = new Map<TParam, object>();
  const atoms = new WeakMap<object, TAtomType>();

  const getKey = (param: TParam) => {
    if (areEqual === undefined) {
      return keys.get(param);
    }

    for (const [key, value] of keys) {
      if (areEqual(key, param)) {
        return value;
      }
    }

    return undefined;
  };

  const deleteKey = (param: TParam) => {
    if (areEqual === undefined) {
      return keys.delete(param);
    }

    for (const key of keys.keys()) {
      if (areEqual(key, param)) {
        return keys.delete(param);
      }
    }

    return false;
  };

  return Object.assign(
    (param: TParam) => {
      const key = getKey(param);

      if (key !== undefined) {
        const atom = atoms.get(key);

        if (atom !== undefined) {
          return atom;
        }
      }

      const newKey = {};
      keys.set(param, newKey);

      const newAtom = initializeAtom(param);
      atoms.set(newKey, newAtom);

      return newAtom;
    },
    {
      remove: (param: TParam) => {
        const key = getKey(param);

        if (key === undefined) {
          return;
        }

        deleteKey(param);
        atoms.delete(key);
      },
    },
  );
}

export class AtomFamilyError extends QueryError {
  constructor(
    readonly atomFamily: WeakAtomFamily<unknown, unknown>,
    readonly param: unknown,
    message: string | undefined,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }

  static fromAtomFamilyError<
    TError,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TAtomFamily extends WeakAtomFamily<any, any>,
  >(
    error: TError,
    atomFamily: TAtomFamily,
    param: TAtomFamily extends WeakAtomFamily<infer Param, infer _>
      ? Param
      : unknown,
    message?: string,
  ) {
    return new this(atomFamily, param, message, {
      cause: error,
    });
  }
}

export function withAtomFamilyErrorCatcher<
  TParam,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TRead extends (get: Getter, ...args: unknown[]) => any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TAtomCreator extends (read: TRead, ...args: any[]) => Atom<unknown>,
>(
  atomFamily: WeakAtomFamily<TParam, unknown>,
  param: TParam,
  atomCreator: TAtomCreator,
): TAtomCreator {
  // @ts-expect-error complex sub-type
  const atomCatching: TAtomCreator = (read, ...args) => {
    // @ts-expect-error complex sub-type
    const readCatching: TRead = (...readArgs) => {
      try {
        const value = read(...readArgs);

        if (value instanceof Promise) {
          return value.catch((error) => {
            throw AtomFamilyError.fromAtomFamilyError(error, atomFamily, param);
          });
        }

        if (value instanceof Observable) {
          return value.pipe(
            catchError((error) => {
              throw AtomFamilyError.fromAtomFamilyError(
                error,
                atomFamily,
                param,
              );
            }),
          );
        }

        return value;
      } catch (error) {
        throw AtomFamilyError.fromAtomFamilyError(error, atomFamily, param);
      }
    };

    return atomCreator(readCatching, ...args);
  };

  return atomCatching;
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
