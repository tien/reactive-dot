import { useLocalStore } from "./use-local-store.js";
import { renderHook } from "@testing-library/react";
import { Provider, createStore, getDefaultStore } from "jotai";
import type { PropsWithChildren } from "react";
import { expect, it } from "vitest";

it("returns a new store when no Provider is used", () => {
  const { result, rerender } = renderHook(() => useLocalStore());
  const firstStore = result.current;

  // It should not be the default store
  expect(firstStore).not.toBe(getDefaultStore());
  // Rerendering should return the same store instance
  rerender();
  expect(result.current).toBe(firstStore);
});

it("provides a distinct store for each hook instance without Provider", () => {
  const { result: r1 } = renderHook(() => useLocalStore());
  const { result: r2 } = renderHook(() => useLocalStore());

  expect(r1.current).not.toBe(r2.current);
});

it("returns the context store when a custom store is provided", () => {
  const customStore = createStore();

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={customStore}>{children}</Provider>
  );

  const { result } = renderHook(() => useLocalStore(), { wrapper: Wrapper });

  expect(result.current).toBe(customStore);
});
