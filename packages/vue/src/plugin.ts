import { useWalletsInitializer } from "./composables/use-wallets-initializer.js";
import { configKey, lazyValuesKey, mutationEventKey } from "./keys.js";
import type { Config } from "@reactive-dot/core";
import { shallowRef, type Plugin } from "vue";

export const ReactiveDotPlugin = {
  install(app, config) {
    app.provide(configKey, config);
    app.provide(lazyValuesKey, new Map());
    app.provide(mutationEventKey, shallowRef());
    app.runWithContext(() => {
      useWalletsInitializer().execute();
    });
  },
} satisfies Plugin<[Config]>;
