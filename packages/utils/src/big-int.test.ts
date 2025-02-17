import { BigIntMath } from "./big-int";
import { describe, expect, it } from "vitest";

describe("min", () => {
  it("gets the correct minimum value", () =>
    expect(BigIntMath.min(-1n, 0n, 1n, -2n)).toBe(-2n));

  it("returns the first value if only one value is passed", () =>
    expect(BigIntMath.min(1n)).toBe(1n));

  it("returns 0n if no values is passed", () =>
    expect(BigIntMath.min()).toBe(0n));
});

describe("max", () => {
  it("gets the correct maximum value", () =>
    expect(BigIntMath.max(-1n, 0n, 1n, 0n)).toBe(1n));

  it("returns the first value if only one value is passed", () =>
    expect(BigIntMath.max(-1n)).toBe(-1n));

  it("returns 0n if no values is passed", () =>
    expect(BigIntMath.max()).toBe(0n));
});

it("has custom string tag", () =>
  expect(BigIntMath.toString()).toBe("[object BigIntMath]"));
