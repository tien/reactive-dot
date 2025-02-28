import { atomWithObservableAndPromise } from "./atom-with-observable-and-promise.js";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useAtomValue } from "jotai/react";
import { BehaviorSubject, firstValueFrom, of, switchMap } from "rxjs";
import { expect, it } from "vitest";

it("should return an atom with the initial value from the observable", async () => {
  const observable$ = of("initial");
  const { observableAtom } = atomWithObservableAndPromise(() => observable$);
  const render = renderHook(() => useAtomValue(observableAtom));

  expect(render.result.current).toBe("initial");
});

it("should update the atom when the observable emits a new value", async () => {
  const subject$ = new BehaviorSubject("initial");
  const { observableAtom } = atomWithObservableAndPromise(() => subject$);
  const render = renderHook(() => useAtomValue(observableAtom));

  expect(render.result.current).toBe("initial");

  act(() => {
    subject$.next("updated");
  });

  expect(render.result.current).toBe("updated");
});

it("should return a promise atom that resolves with the first value from the observable", async () => {
  const observable$ = of("initial");
  const { promiseAtom } = atomWithObservableAndPromise(() => observable$);
  const render = await act(() => renderHook(() => useAtomValue(promiseAtom)));

  await waitFor(() => firstValueFrom(observable$));

  expect(render.result.current).toBe("initial");
});

it("should return a promise atom that resolves with the first value from the observable, even when the observable emits multiple values", async () => {
  const subject$ = new BehaviorSubject("initial");
  const { promiseAtom } = atomWithObservableAndPromise(() => subject$);
  const render = await act(() => renderHook(() => useAtomValue(promiseAtom)));

  expect(render.result.current).toBe("initial");

  act(() => subject$.next("updated"));

  expect(render.result.current).toBe("initial");
});

it("should return a promise atom that will be updated from an observable atom mounted elsewhere", async () => {
  const subject$ = new BehaviorSubject("initial");
  const { promiseAtom, observableAtom } = atomWithObservableAndPromise(
    () => subject$,
  );
  const render = await act(() => renderHook(() => useAtomValue(promiseAtom)));

  expect(render.result.current).toBe("initial");

  act(() => subject$.next("updated"));

  expect(render.result.current).toBe("initial");

  renderHook(() => useAtomValue(observableAtom));

  expect(render.result.current).toBe("updated");
});

it("should handle errors in the observable", async () => {
  const observable$ = new BehaviorSubject("initial");
  const { observableAtom } = atomWithObservableAndPromise(() => observable$);

  const render = renderHook(() => useAtomValue(observableAtom));

  expect(render.result.current).toBe("initial");

  const error = new Error("Test");

  try {
    act(() => observable$.error(error));
  } catch {
    /* empty */
  }

  expect(() => render.rerender()).toThrow(error);
});

it("should propagate errors from the observable atom to the promise atom", async () => {
  const observable$ = new BehaviorSubject("initial");
  const { promiseAtom, observableAtom } = atomWithObservableAndPromise(
    () => observable$,
  );

  const render = await act(() => renderHook(() => useAtomValue(promiseAtom)));
  renderHook(() => useAtomValue(observableAtom));

  expect(render.result.current).toBe("initial");

  const error = new Error("Test");

  try {
    act(() => observable$.error(error));
  } catch {
    /* empty */
  }

  expect(() => render.rerender()).toThrow(error);
});

it("should allow enhancing the atom", async () => {
  const observable$ = of("initial");

  const enhancedAtoms = new Set<object>();

  const { observableAtom } = atomWithObservableAndPromise(
    () => observable$,
    (atomCreator) => {
      enhancedAtoms.add(atomCreator);
      return atomCreator;
    },
  );

  const render = renderHook(() => useAtomValue(observableAtom));

  expect(render.result.current).toBe("initial");
  expect(enhancedAtoms).toHaveLength(2);
});

it("should work with a delayed observable", async () => {
  const delay = Promise.withResolvers<boolean>();

  const observable$ = of("initial").pipe(switchMap(() => delay.promise));
  const { observableAtom } = atomWithObservableAndPromise(() => observable$);

  const render = await act(() =>
    renderHook(() => useAtomValue(observableAtom)),
  );

  expect(render.result.current).toBe(null);

  delay.resolve(true);

  await act(async () => render.rerender());

  expect(render.result.current).toBeTruthy();
});

it("should handle undefined values", async () => {
  const observable$ = of(undefined);
  const { observableAtom } = atomWithObservableAndPromise(() => observable$);
  const render = renderHook(() => useAtomValue(observableAtom));

  expect(render.result.current).toBe(undefined);
});
