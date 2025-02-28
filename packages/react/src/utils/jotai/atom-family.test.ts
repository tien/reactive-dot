import { atomFamily } from "./atom-family.js";
import { atom } from "jotai";
import { expect, it } from "vitest";

it("should create atoms with different values", () => {
  const countAtomFamily = atomFamily((id: number) => atom(id));

  const atom1 = countAtomFamily(1);
  const atom2 = countAtomFamily(2);

  expect(atom1).not.toBe(atom2);
  expect(atom1.init).toBe(1);
  expect(atom2.init).toBe(2);
});

it("should return same atom for same arguments", () => {
  const countAtomFamily = atomFamily((id: number) => atom(id));

  const atom1 = countAtomFamily(1);
  const atom2 = countAtomFamily(1);

  expect(atom1).toBe(atom2);
});

it("should return same atom for multiple arguments with matching order and values", () => {
  const arrayAtomFamily = atomFamily(
    (number: number, object: object, string: string) =>
      atom([number, object, string]),
  );

  const obj = {};
  const atom1 = arrayAtomFamily(1, obj, "test");
  const atom2 = arrayAtomFamily(1, obj, "test");

  expect(atom1).toBe(atom2);
});

it("should use custom key generator", () => {
  const countAtomFamily = atomFamily(
    (a: number, b: number) => atom(a + b),
    (a, b) => [a, b]?.toSorted().join(),
  );

  const atom1 = countAtomFamily(1, 2);
  const atom2 = countAtomFamily(1, 2);
  const atom3 = countAtomFamily(2, 1);

  expect(atom1).toBe(atom2);
  expect(atom1).toBe(atom3);
});

it("should delete atoms", () => {
  const countAtomFamily = atomFamily((id: number) => atom(id));

  const atom1 = countAtomFamily(1);

  expect(countAtomFamily.delete(1)).toBe(true);

  const atom2 = countAtomFamily(1);

  expect(atom1).not.toBe(atom2);
});

it("should handle no arguments", () => {
  const noArgsFamily = atomFamily(() => atom(0));

  const atom1 = noArgsFamily();
  const atom2 = noArgsFamily();

  expect(atom1).toBe(atom2);
});
