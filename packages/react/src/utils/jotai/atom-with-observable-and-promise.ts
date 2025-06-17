import {
  atomWithObservable,
  empty as emptyInitial,
} from "./atom-with-observable.js";
import { atom, type Atom, type Getter } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { firstValueFrom, shareReplay, type Observable } from "rxjs";

const empty = Symbol("empty");

type Data<T> = { value: T | Promise<T> | typeof empty } | { error: unknown };

export type ObservableAndPromiseAtom<T> = {
  observableAtom: Atom<T | Promise<T>>;
  promiseAtom: Atom<T | Promise<T>>;
};

export function atomWithObservableAndPromise<
  TValue,
  TAtomEnhancer extends <TAtomType extends Atom<unknown>>(
    atomType: TAtomType,
  ) => TAtomType,
>(
  getObservable: (get: Getter) => Observable<TValue>,
  enhanceAtom: TAtomEnhancer = ((atomCreator) => atomCreator) as TAtomEnhancer,
): ObservableAndPromiseAtom<TValue> {
  const sourceObservable = atom((get) =>
    getObservable(get).pipe(shareReplay({ bufferSize: 1, refCount: true })),
  );

  const dataAtom = atom<Data<TValue>>({ value: empty });

  const initialDataAtom = atom<{ value: TValue | typeof empty }>({
    value: empty,
  });

  const observableAtom = withAtomEffect(
    enhanceAtom(
      atomWithObservable((get) => get(sourceObservable), {
        initialValue: (get) => {
          const value = get(initialDataAtom).value;
          return value === empty ? emptyInitial : value;
        },
      }),
    ),
    (get, set) => {
      try {
        set(dataAtom, { value: get(observableAtom) });
      } catch (error) {
        set(dataAtom, { error });
      }
    },
  );

  const promiseAtom = enhanceAtom(
    atom((get) => {
      const data = get(dataAtom);

      if ("error" in data) {
        throw data.error;
      }

      if (data.value !== empty) {
        return data.value;
      }

      const initialData = get(initialDataAtom);

      return firstValueFrom(get(sourceObservable)).then((value) => {
        initialData.value = value;
        return value;
      });
    }),
  );

  return { promiseAtom, observableAtom };
}

export function mapAtomWithObservableAndPromise<
  TAtom extends
    ObservableAndPromiseAtom<// eslint-disable-next-line @typescript-eslint/no-explicit-any
    any>,
  TOut,
>(
  atom: TAtom,
  mapper: (atom: TAtom["observableAtom"] | TAtom["promiseAtom"]) => TOut,
) {
  return {
    promiseAtom: mapper(atom.promiseAtom),
    observableAtom: mapper(atom.observableAtom),
  };
}
