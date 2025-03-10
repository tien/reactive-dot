import { atom, type Atom, type Getter } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { atomWithObservable } from "jotai/utils";
import { type Observable } from "rxjs";

type Data<T> = { value: T | Promise<T> } | { error: unknown };

export function atomWithObservableAndPromise<
  TValue,
  TAtomEnhancer extends <TAtomType extends Atom<unknown>>(
    atomType: TAtomType,
  ) => TAtomType,
>(
  getObservable: (get: Getter) => Observable<TValue>,
  enhanceAtom: TAtomEnhancer = ((atomCreator) => atomCreator) as TAtomEnhancer,
): {
  observableAtom: Atom<TValue | Promise<TValue>>;
  promiseAtom: Atom<TValue | Promise<TValue>>;
} {
  const { promise: initialPromise } = Promise.withResolvers<TValue>();

  const dataAtom = atom<Data<TValue>>({ value: initialPromise });

  const observableAtom = withAtomEffect(
    enhanceAtom(atomWithObservable(getObservable)),
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

      if ("value" in data && data.value !== initialPromise) {
        return data.value;
      }

      return get(observableAtom);
    }),
  );

  return { promiseAtom, observableAtom };
}
