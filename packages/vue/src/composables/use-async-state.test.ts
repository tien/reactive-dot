import { useAsyncState } from "./use-async-state.js";
import { expect, it } from "vitest";

it("should return initial state", () => {
  const state = useAsyncState();

  expect(state.data.value).toBeUndefined();
  expect(state.error.value).toBeUndefined();
  expect(state.status.value).toBe("idle");
});
