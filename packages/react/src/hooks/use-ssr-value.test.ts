import * as configModule from "./use-config.js";
import { useSsrValue } from "./use-ssr-value.js";
import type { Config } from "@reactive-dot/core";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("useSsrValue", () => {
  const values: unknown[] = [];

  beforeEach(() => {
    vi.resetAllMocks();
    values.length = 0;
  });

  it("returns clientValue immediately when SSR is disabled", () => {
    vi.spyOn(configModule, "useConfig").mockReturnValue({
      ssr: false,
    } as Config);

    renderHook(() => values.push(useSsrValue("c", "s")));

    expect(values).toEqual(["c"]);
  });

  it("switches from serverValue to clientValue after hydration when SSR is enabled", async () => {
    vi.spyOn(configModule, "useConfig").mockReturnValue({
      ssr: true,
    } as Config);

    renderHook(() => values.push(useSsrValue("c", "s")));

    expect(values).toEqual(["s", "c"]);
  });
});
