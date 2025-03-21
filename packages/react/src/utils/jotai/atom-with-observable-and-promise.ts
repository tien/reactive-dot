import { atomWithObservable } from "./atom-with-observable.js";
import { atom, type Atom, type Getter } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { firstValueFrom, shareReplay, type Observable } from "rxjs";

const empty = Symbol("empty");

type Data<T> = { value: T | Promise<T> | typeof empty } | { error: unknown };

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

  const dataAtom = atom<Data<TValue>>({ value: empty });

  const initialDataAtom = atom<{ value: TValue | typeof empty }>({
    value: empty,
  });

  const observableAtom = withAtomEffect(
    enhanceAtom(
      atom((get) => {
        const initialData = get(initialDataAtom);
        return get(
          atomWithObservable(
            (get) => get(sourceObservable),
            initialData.value === empty
              ? undefined
              : { initialValue: initialData.value },
          ),
        );
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
