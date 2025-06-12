import { configKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useWalletsInitializer } from "./use-wallets-initializer.js";
import { defineConfig } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import { expect, it } from "vitest";

it("initializes wallets from the config", async () => {
  const wallet = new MockWallet([]);
  const config = defineConfig({ chains: {}, wallets: [wallet] });

  const {
    result: { execute },
  } = withSetup(() => useWalletsInitializer(), {
    [configKey]: config,
  });

  expect(wallet.initialized$.getValue()).toBe(false);

  await execute();

  expect(wallet.initialized$.getValue()).toBe(true);
});
