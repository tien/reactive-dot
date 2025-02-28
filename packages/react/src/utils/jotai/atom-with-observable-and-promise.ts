import { atom, type Atom, type Getter } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { atomWithObservable } from "jotai/utils";
import { firstValueFrom, type Observable } from "rxjs";

export function atomWithObservableAndPromise<
  TValue,
  TAtomEnhancer extends <
    TAtomCreator extends (...args: never[]) => Atom<unknown>,
  >(
    atomCreator: TAtomCreator,
  ) => TAtomCreator,
>(
  getObservable: (get: Getter) => Observable<TValue>,
  enhanceAtom: TAtomEnhancer = ((atomCreator) => atomCreator) as TAtomEnhancer,
): {
  observableAtom: Atom<TValue | Promise<TValue>>;
  promiseAtom: Atom<TValue | Promise<TValue>>;
} {
  const rawObservableAtom = atom(getObservable);

  const initialPromise = new Promise<TValue>(() => {});

  const promiseStateAtom = atom<TValue | Promise<TValue>>(initialPromise);

  const promiseAtom = enhanceAtom(atom)((get) => {
    const promiseState = get(promiseStateAtom);

    if (promiseState !== initialPromise) {
      return promiseState;
    }

    return firstValueFrom(get(rawObservableAtom));
  });

  const observableAtom = withAtomEffect(
    enhanceAtom(atomWithObservable)((get) => get(rawObservableAtom)),
    (get, set) => {
      set(promiseStateAtom, get(observableAtom));
    },
  );

  return { promiseAtom, observableAtom };
}
