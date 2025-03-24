import { atomWithPromise } from "./atom-with-promise.js";
import { act, renderHook } from "@testing-library/react";
import { atom, createStore } from "jotai";
import { useAtom, useAtomValue } from "jotai/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("atomWithPromise", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle synchronous values", () => {
    const syncAtom = atomWithPromise(() => "test value");
    const { result } = renderHook(() => useAtomValue(syncAtom));

    expect(result.current).toBe("test value");
  });

  it("should throw errors when promise rejects", async () => {
    const store = createStore();

    const error = new Error("Test error");
    const errorAtom = atomWithPromise(() => Promise.reject(error));

    await expect(() => store.get(errorAtom)).rejects.toThrow(error);
  });

  it("should refresh when triggered", async () => {
    let counter = 0;

    const refreshAtom = atomWithPromise(() =>
      Promise.resolve(`value ${++counter}`),
    );

    const { result, rerender } = await act(() =>
      renderHook(() => useAtom(refreshAtom)),
    );

    expect(result.current[0]).toBe("value 1");

    // Trigger refresh
    await act(() => {
      result.current[1]();
    });

    act(() => rerender());

    expect(result.current[0]).toBe("value 2");
  });

  it.todo("should use the abort signal", async () => {
    const abortSpy = vi.fn();
    const promiseWithAbort = atomWithPromise((_, { signal }) => {
      signal.addEventListener("abort", abortSpy);
      return new Promise((resolve) =>
        setTimeout(() => resolve("late value"), 10000),
      );
    });

    const { unmount } = await act(() =>
      renderHook(() => useAtomValue(promiseWithAbort)),
    );

    unmount();

    expect(abortSpy).toHaveBeenCalled();
  });

  it("should interact with other atoms", async () => {
    const baseAtom = atom("initial");
    const derivedAtom = atomWithPromise((get) => {
      const base = get(baseAtom);
      return Promise.resolve(`derived from ${base}`);
    });

    const { result } = await act(() =>
      renderHook(() => {
        const [base, setBase] = useAtom(baseAtom);
        const [derived, refreshDerived] = useAtom(derivedAtom);
        return { base, setBase, derived, refreshDerived };
      }),
    );

    expect(result.current.derived).toBe("derived from initial");

    // Update the base atom
    await act(() => {
      result.current.setBase("updated");
      result.current.refreshDerived();
    });

    expect(result.current.derived).toBe("derived from updated");
  });
});
