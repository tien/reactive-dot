import { atomWithObservable } from "./atom-with-observable.js";
import { atom, type Atom, type Getter } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { firstValueFrom, shareReplay, type Observable } from "rxjs";

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
  const sourceObservable = atom((get) =>
    getObservable(get).pipe(shareReplay({ bufferSize: 1, refCount: true })),
  );

  const { promise: initialPromise } = Promise.withResolvers<TValue>();

  const dataAtom = atom<Data<TValue>>({ value: initialPromise });

  const observableAtom = withAtomEffect(
    enhanceAtom(atomWithObservable((get) => get(sourceObservable))),
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

      return firstValueFrom(get(sourceObservable));
    }),
  );

  return { promiseAtom, observableAtom };
}
