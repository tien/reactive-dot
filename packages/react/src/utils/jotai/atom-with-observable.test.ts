import { useAtomValue } from "../../hooks/use-atom-value.js";
import { atomWithObservable } from "./atom-with-observable.js";
import { act, renderHook } from "@testing-library/react";
import { createStore } from "jotai";
import { Observable, Subject, throwError } from "rxjs";
import { beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetAllMocks();
});

it("should initialize with the provided initial value", () => {
  const observable = new Observable<number>(() => {
    // This will be called later when subscribed
    return { unsubscribe: () => {} };
  });

  const testAtom = atomWithObservable(() => observable, { initialValue: 42 });

  const { result } = renderHook(() => useAtomValue(testAtom));
  expect(result.current).toBe(42);
});

it("should update value when observable emits", async () => {
  const subject = new Subject<number>();
  const testAtom = atomWithObservable(() => subject, { initialValue: 0 });

  const { result, rerender } = renderHook(() => useAtomValue(testAtom));

  expect(result.current).toBe(0);

  act(() => {
    subject.next(99);
  });

  rerender();
  expect(result.current).toBe(99);
});

// TODO: fix unhandled error
it("should throw error when observable emits error", async () => {
  const store = createStore();

  const testError = new Error("Test error");

  const observable = throwError(() => testError);

  const testAtom = atomWithObservable(() => observable);

  await expect(() => store.get(testAtom)).rejects.toThrow(testError);
});

it("should unsubscribe when unmounted", async () => {
  const unsubscribe = vi.fn();
  const observable = new Observable<number>((observer) => {
    observer.add(unsubscribe);
    observer.next(42);
  });

  const testAtom = atomWithObservable(() => observable);

  const { unmount } = await act(() => renderHook(() => useAtomValue(testAtom)));

  unmount();

  expect(unsubscribe).toHaveBeenCalled();
});
