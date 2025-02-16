import { objectId } from "./object-id.js";
import { expect, it } from "vitest";

it("returns same value for primitive types", () => {
  expect(objectId(null)).toBe(null);
  expect(objectId(undefined)).toBe(undefined);
  expect(objectId(42)).toBe(42);
  expect(objectId(69n)).toBe(69n);
  expect(objectId("string")).toBe("string");
  expect(objectId(true)).toBe(true);
});

it("returns same id for same object reference", () => {
  const obj = { test: "value" };
  const id1 = objectId(obj);
  const id2 = objectId(obj);

  expect(id1).toBe(id2);
});

it("returns different ids for different objects with same content", () => {
  const obj1 = { test: "value" };
  const obj2 = { test: "value" };
  const id1 = objectId(obj1);
  const id2 = objectId(obj2);

  expect(id1).not.toBe(id2);
});

it("works with arrays", () => {
  const arr = [1, 2, 3];
  const id1 = objectId(arr);
  const id2 = objectId(arr);

  expect(id1).toBe(id2);
});
