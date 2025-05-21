import { isSsr } from "./is-ssr.js";
import { it, expect, afterEach, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("returns true when window is undefined", () => {
  vi.stubGlobal("window", undefined);
  expect(isSsr()).toBe(true);
});

it("returns false when window is defined", () => {
  expect(isSsr()).toBe(false);
});
