import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  platform: "neutral",
  format: "esm",
  dts: true,
  clean: true,
});
