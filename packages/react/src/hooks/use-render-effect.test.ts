import { useRenderEffect } from "./use-render-effect.js";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

describe("useRenderEffect", () => {
  it("should call effect when key changes", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ key }) => useRenderEffect(effect, key), {
      initialProps: { key: "initial" },
    });

    expect(effect).not.toHaveBeenCalled();

    rerender({ key: "changed" });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ key: "changed" });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ key: "changed again" });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it("should work with different key types", () => {
    const effect = vi.fn();

    // Number
    const { rerender: rerenderNumber } = renderHook(
      ({ key }) => useRenderEffect(effect, key),
      { initialProps: { key: 1 } },
    );
    rerenderNumber({ key: 2 });
    expect(effect).toHaveBeenCalled();

    // Object
    const obj1 = { test: 1 };
    const obj2 = { test: 1 };
    const { rerender: rerenderObject } = renderHook(
      ({ key }) => useRenderEffect(effect, key),
      { initialProps: { key: obj1 } },
    );
    rerenderObject({ key: obj2 });
    expect(effect).toHaveBeenCalledTimes(2);

    // Boolean
    const { rerender: rerenderBoolean } = renderHook(
      ({ key }) => useRenderEffect(effect, key),
      { initialProps: { key: false } },
    );
    rerenderBoolean({ key: true });
    expect(effect).toHaveBeenCalledTimes(3);
  });

  it("should not call effect if key does not change", () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ key }) => useRenderEffect(effect, key), {
      initialProps: { key: "same" },
    });

    rerender({ key: "same" });
    expect(effect).not.toHaveBeenCalled();

    rerender({ key: "same" });
    expect(effect).not.toHaveBeenCalled();
  });
});
