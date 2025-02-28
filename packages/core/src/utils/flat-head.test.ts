import { flatHead } from "./flat-head.js";
import { expect, it } from "vitest";

it("should return the single element for a one-item tuple", () => {
  const value = [42];
  const result = flatHead(value);

  expect(result).toBe(42);
});

it("should return unchanged value for an empty array", () => {
  const value: unknown[] = [];
  const result = flatHead(value);

  expect(result).toEqual(value);
});

it("should return unchanged value for an array with more than one element", () => {
  const value = [1, 2];
  const result = flatHead(value);

  expect(result).toEqual(value);
});

it("should return unchanged non-array value", () => {
  const value = "test";
  const result = flatHead(value);

  expect(result).toBe("test");
});

it("should handle objects correctly", () => {
  const value = { a: 1 };
  const result = flatHead(value);

  expect(result).toEqual(value);
});
