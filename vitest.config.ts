import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json-summary", "json"],
      reportOnFailure: true,
      include: ["packages/**"],
      exclude: [
        "**/build/**",
        "packages/eslint-config",
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});
