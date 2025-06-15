import { interlace } from "./interlace.js";
import { expect, it } from "vitest";

it.each([
  {
    array: [1, 2, 3],
    itemsWithIndexes: [
      [4, 1],
      [5, 3],
    ] satisfies [number, number][],
    expected: [1, 4, 2, 5, 3],
  },
  {
    array: [],
    itemsWithIndexes: [
      [1, 0],
      [2, 1],
    ] satisfies [number, number][],
    expected: [1, 2],
  },
  {
    array: [1, 2, 3],
    itemsWithIndexes: [] satisfies [number, number][],
    expected: [1, 2, 3],
  },
  {
    array: [1, 2, 3],
    itemsWithIndexes: [
      [4, 1],
      [5, 1],
    ] satisfies [number, number][],
    expected: [1, 5, 4, 2, 3],
  },
  {
    array: ["a", "b", "c"],
    itemsWithIndexes: [
      ["x", 0],
      ["y", 2],
      ["z", 4],
      ["@", 6],
    ] satisfies [string, number][],
    expected: ["x", "a", "y", "b", "z", "c", "@"],
  },
])(
  "should produce the following: $itemsWithIndexes -> $array = $expected",
  ({ array, itemsWithIndexes, expected }) => {
    expect(interlace<string | number>(array, itemsWithIndexes)).toEqual(
      expected,
    );
  },
);
