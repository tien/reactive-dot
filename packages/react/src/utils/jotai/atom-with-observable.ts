import { atom, type Getter } from "jotai";
import { type Observable, firstValueFrom } from "rxjs";

type Data<T> = { value: T } | { error: unknown };

export const empty = Symbol("empty");

export function atomWithObservable<TValue>(
  getObservable: (get: Getter) => Observable<TValue>,
  options?: {
    initialValue?: TValue | ((get: Getter) => TValue | typeof empty);
  },
) {
  const observableAtom = atom((get) => {
    const observable = getObservable(get);

    const initialValue = (() => {
      if (options === undefined) {
        return empty;
      }

      if (!("initialValue" in options)) {
        return empty;
      }

      if (options.initialValue instanceof Function) {
        return options.initialValue(get);
      }

      return options.initialValue;
    })();

    const dataAtom = atom<Data<TValue | Promise<TValue>>>(
      initialValue !== empty
        ? {
            value: initialValue,
          }
        : { value: firstValueFrom(observable) },
    );

    dataAtom.onMount = (update) => {
      const subscription = observable.subscribe({
        next: (value) => update({ value }),
        error: (error) => update({ error }),
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    return dataAtom;
  });

  return atom((get) => {
    const data = get(get(observableAtom));

    if ("error" in data) {
      throw data.error;
    }

    return data.value;
  });
}
