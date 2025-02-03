import { toObservable } from "./to-observable.js";
import { isObservable, lastValueFrom, of } from "rxjs";
import { expect, it } from "vitest";

it("should return an observable that emits the same value for non-promise/non-observable inputs", async () => {
  const value = 42;
  const observable = toObservable(value);

  expect(isObservable(observable)).toBe(true);

  const result = await lastValueFrom(observable);

  expect(result).toBe(value);
});

it("should handle promise values by converting them to an observable", async () => {
  const value = "test";
  const promise = Promise.resolve(value);
  const observable = toObservable(promise);

  expect(isObservable(observable)).toBe(true);

  const result = await lastValueFrom(observable);

  expect(result).toBe(value);
});

it("should return the same observable if an observable is provided", async () => {
  const originalObservable = of("observable");
  const newObservable = toObservable(originalObservable);

  expect(newObservable).toBe(originalObservable);

  const result = await lastValueFrom(newObservable);

  expect(result).toBe("observable");
});
