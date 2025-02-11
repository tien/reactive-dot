import {
  erroredSymbol,
  lazyValue,
  useLazyValuesCache,
} from "./use-lazy-value.js";
import { ReactiveDotError } from "@reactive-dot/core";
import { firstValueFrom, Observable, of, throwError } from "rxjs";
import { beforeEach, expect, it, vi } from "vitest";
import { inject } from "vue";

vi.mock("vue", () => ({
  inject: vi.fn(),
  computed: vi.fn((fn) => ({ value: fn() })),
  shallowRef: vi.fn((val) => ({ value: val })),
  toValue: vi.fn((val) => val),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it("should throw if no cache is provided", () => {
  vi.mocked(inject).mockReturnValue(undefined);
  expect(() => useLazyValuesCache()).toThrow(ReactiveDotError);
});

it("should handle primitive values", () => {
  const cache = new Map();
  const value = lazyValue(["test"], () => 123, cache);

  expect(value.value).toBe(123);
});

it("should handle promises", async () => {
  const cache = new Map();
  const promise = Promise.resolve(123);
  const value = lazyValue(["test"], () => promise, cache);

  await expect(value.value).resolves.toBe(123);
});

it("should handle observables", () => {
  const cache = new Map();
  const observable = of(123);
  const value = lazyValue(["test"], () => observable, cache);

  expect(value.value).toBeInstanceOf(Observable);
});

it("should cache values", () => {
  const cache = new Map();
  const getter = vi.fn(() => 123);

  lazyValue(["test"], getter, cache);
  lazyValue(["test"], getter, cache);

  expect(getter).toHaveBeenCalledTimes(1);
});

it("should handle errors in promises", async () => {
  const cache = new Map();
  const error = new Error("test error");
  const value = lazyValue(["test"], () => Promise.reject(error), cache);

  await expect(value.value).rejects.toThrow(error);
  expect(cache.get("test")[erroredSymbol]).toBe(true);
});

it("should handle errors in observables", async () => {
  const cache = new Map();
  const error = new Error("test error");
  const value = lazyValue(["test"], () => throwError(() => error), cache);

  await expect(() => firstValueFrom(value.value)).rejects.toThrow(error);
  expect(cache.get("test")[erroredSymbol]).toBe(true);
});
