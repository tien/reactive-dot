import { configKey, lazyValuesKey } from "./keys.js";
import type { Config } from "@reactive-dot/core";
import type { Plugin } from "vue";

export const ReactiveDotPlugin = {
  install(app, config) {
    app.provide(configKey, config);
    app.provide(lazyValuesKey, new Map());
  },
} satisfies Plugin<[Config]>;
