import type { Config } from "./config";
import { defineConfig } from "./config";
import { expect, it } from "vitest";

it("should return the config object as-is", () => {
  const mockConfig = {} as unknown as Config;
  const config = defineConfig(mockConfig);

  expect(config).toBe(mockConfig);
});
