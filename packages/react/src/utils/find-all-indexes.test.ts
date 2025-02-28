import { findAllIndexes } from "./find-all-indexes.js";
import { expect, it } from "vitest";

it("should return empty array when no matches found", () => {
  const array = [1, 2, 3];
  const result = findAllIndexes(array, (x) => x > 5);

  expect(result).toEqual([]);
});

it("should find all matching indexes", () => {
  const array = [1, 2, 1, 3, 1];
  const result = findAllIndexes(array, (x) => x === 1);

  expect(result).toEqual([0, 2, 4]);
});

it("should work with empty array", () => {
  const array: number[] = [];
  const result = findAllIndexes(array, (x) => x === 1);

  expect(result).toEqual([]);
});
