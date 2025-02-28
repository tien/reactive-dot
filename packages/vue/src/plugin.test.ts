import * as walletsInitializer from "./composables/use-wallets-initializer.js";
import { configKey, lazyValuesKey, mutationEventKey } from "./keys.js";
import { ReactiveDotPlugin } from "./plugin.js";
import type { Config } from "@reactive-dot/core";
import { beforeEach, expect, it, vi } from "vitest";
import type { App } from "vue";

const mockApp = {
  provide: vi.fn(),
  runWithContext: vi.fn((fn) => fn()),
} as unknown as App;

const mockExecute = vi.fn();

vi.spyOn(walletsInitializer, "useWalletsInitializer").mockReturnValue({
  execute: mockExecute,
} as unknown as ReturnType<typeof walletsInitializer.useWalletsInitializer>);

const mockConfig = {} as unknown as Config;

beforeEach(() => {
  vi.clearAllMocks();
});

it("should provide config using configKey", () => {
  ReactiveDotPlugin.install(mockApp, mockConfig);

  expect(mockApp.provide).toHaveBeenCalledWith(configKey, mockConfig);
});

it("should provide empty Map using lazyValuesKey", () => {
  ReactiveDotPlugin.install(mockApp, mockConfig);

  expect(mockApp.provide).toHaveBeenCalledWith(lazyValuesKey, expect.any(Map));
});

it("should provide shallowRef using mutationEventKey", () => {
  ReactiveDotPlugin.install(mockApp, mockConfig);

  expect(mockApp.provide).toHaveBeenCalledWith(
    mutationEventKey,
    expect.any(Object),
  );
});

it("should initialize wallets", () => {
  ReactiveDotPlugin.install(mockApp, mockConfig);

  expect(mockExecute).toHaveBeenCalled();
});
