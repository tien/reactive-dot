import { QueryOptionsProvider } from "../contexts/query-options.js";
import { atomWithObservableAndPromise } from "../utils/jotai/atom-with-observable-and-promise.js";
import { atomWithObservable } from "../utils/jotai/atom-with-observable.js";
import { useAtomValue } from "./use-atom-value.js";
import { usePausableAtomValue } from "./use-pausable-atom-value.js";
import { renderHook } from "@testing-library/react";
import { act, type PropsWithChildren } from "react";
import { BehaviorSubject } from "rxjs";
import { expect, it } from "vitest";

it("should return observable atom when subscription is set to active", async () => {
  const subject = new BehaviorSubject("initial");
  const valueAtom = atomWithObservableAndPromise(() => subject);

  const { result } = await act(() =>
    renderHook(() => usePausableAtomValue(valueAtom), {
      wrapper: ({ children }) => (
        <QueryOptionsProvider active>{children}</QueryOptionsProvider>
      ),
    }),
  );

  expect(result.current).toBe("initial");

  act(() => subject.next("updated"));

  expect(result.current).toBe("updated");
});

it("should return promise atom when subscription is set to inactive", async () => {
  const subject = new BehaviorSubject("initial");
  const valueAtom = atomWithObservableAndPromise(() => subject);

  const { result } = await act(() =>
    renderHook(() => usePausableAtomValue(valueAtom), {
      wrapper: ({ children }) => (
        <QueryOptionsProvider active={false}>{children}</QueryOptionsProvider>
      ),
    }),
  );

  expect(result.current).toBe("initial");

  act(() => subject.next("updated"));

  expect(result.current).toBe("initial");
});

it("should change from inactive to active when subscription status change", async () => {
  const activeSubject = new BehaviorSubject(false);
  const activeAtom = atomWithObservable(() => activeSubject);

  const subject = new BehaviorSubject("initial");
  const valueAtom = atomWithObservableAndPromise(() => subject);

  const Wrapper = ({ children }: PropsWithChildren) => (
    <QueryOptionsProvider active={useAtomValue(activeAtom)}>
      {children}
    </QueryOptionsProvider>
  );

  const { result } = await act(() =>
    renderHook(() => usePausableAtomValue(valueAtom), {
      wrapper: Wrapper,
    }),
  );

  expect(result.current).toBe("initial");

  act(() => subject.next("updated"));

  expect(result.current).toBe("initial");

  act(() => activeSubject.next(true));

  expect(result.current).toBe("updated");
});
