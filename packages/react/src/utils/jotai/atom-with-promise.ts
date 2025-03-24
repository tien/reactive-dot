import { atom, type Getter } from "jotai";
import { startTransition } from "react";

type Data<T> = { value: T } | { error: unknown };

export function atomWithPromise<TValue>(
  getPromise: (
    get: Getter,
    options: { signal: AbortSignal },
  ) => TValue | Promise<TValue>,
) {
  const countAtom = atom(0);

  const promiseAtom = atom((get, { signal }) => {
    get(countAtom);

    const maybePromise = getPromise(get, { signal });

    const dataAtom = atom<Data<TValue | Promise<TValue>>>({
      value: maybePromise,
    });

    dataAtom.onMount = (update) => {
      if (maybePromise instanceof Promise) {
        void maybePromise
          .then((value) => startTransition(() => update({ value })))
          .catch((error) => startTransition(() => update({ error })));
      }
    };

    return dataAtom;
  });

  return atom(
    (get) => {
      const data = get(get(promiseAtom));

      if ("error" in data) {
        throw data.error;
      }

      return data.value;
    },
    (_, set) => {
      set(countAtom, (count) => count + 1);
    },
  );
}
