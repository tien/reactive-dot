import { lazy } from "./lazy";
import { expect, it } from "vitest";

it("only init value once", () => {
  const getValue = lazy(() => Symbol());

  expect(getValue()).toBe(getValue());
});
