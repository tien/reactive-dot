import { useWalletsInitializer } from "./composables/use-wallets-initializer.js";
import { configKey, lazyValuesKey } from "./keys.js";
import type { Config } from "@reactive-dot/core";
import { type Plugin } from "vue";

export const ReactiveDotPlugin = {
  install(app, config) {
    app.provide("foo", "bar");
    app.provide(configKey, config);
    app.provide(lazyValuesKey, new Map());
    app.runWithContext(() => {
      useWalletsInitializer().execute();
    });
  },
} satisfies Plugin<[Config]>;
