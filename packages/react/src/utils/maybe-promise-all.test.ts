import { maybePromiseAll } from "./maybe-promise-all.js";
import { expect, it } from "vitest";

it("returns array as is when no promises are present", () => {
  const input = [1, 2, 3, "string", {}, []];
  const result = maybePromiseAll(input);

  expect(result).toBe(input);
});

it("returns Promise.all result when all items are promises", async () => {
  const input = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
  const result = maybePromiseAll(input);

  expect(result).toBeInstanceOf(Promise);
  await expect(result).resolves.toEqual([1, 2, 3]);
});

it("returns Promise.all result when some items are promises", async () => {
  const input = [1, Promise.resolve(2), 3];
  const result = maybePromiseAll(input);

  expect(result).toBeInstanceOf(Promise);
  await expect(result).resolves.toEqual([1, 2, 3]);
});

it("handles an empty array", () => {
  const input: unknown[] = [];
  const result = maybePromiseAll(input);

  expect(result).toBe(input);
});

it("handles array with undefined/null values", () => {
  const input = [undefined, null];
  const result = maybePromiseAll(input);

  expect(result).toBe(input);
});

it("propagates rejection when a promise rejects", async () => {
  const error = new Error("Test error");
  const input = [Promise.resolve(1), Promise.reject(error), Promise.resolve(3)];
  const result = maybePromiseAll(input);

  await expect(result).rejects.toBe(error);
});
