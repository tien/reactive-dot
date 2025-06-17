import { omit } from "./omit.js";
import { expect, it } from "vitest";

it("removes a single key", () => {
  const obj = { a: 1, b: 2, c: 3 };
  const result = omit(obj, ["b"]);
  expect(result).toEqual({ a: 1, c: 3 });
});

it("removes multiple keys", () => {
  const obj = { a: 1, b: 2, c: 3, d: 4 };
  const result = omit(obj, ["a", "d"]);
  expect(result).toEqual({ b: 2, c: 3 });
});

it("returns original object when keys array is empty", () => {
  const obj = { x: "X", y: "Y" };
  const result = omit(obj, []);
  expect(result).toEqual({ x: "X", y: "Y" });
});

it("ignores keys that do not exist", () => {
  const obj = { foo: true, bar: false };
  const result = omit(obj, ["baz" as keyof typeof obj, "bar"]);
  expect(result).toEqual({ foo: true });
});

it("works with mixed value types", () => {
  const obj = { n: 0, s: "", b: false, u: undefined, o: { nested: 42 } };
  const result = omit(obj, ["s", "u"]);
  expect(result).toEqual({ n: 0, b: false, o: { nested: 42 } });
});

it("is a shallow omit (does not deep clone)", () => {
  const nested = { foo: "bar" };
  const obj = { a: nested, b: 2 };
  const result = omit(obj, ["b"]);
  expect(result.a).toBe(nested);
});
