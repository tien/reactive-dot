import { configKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useWalletConnector } from "./use-wallet-connector.js";
import { defineConfig } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import { expect, it } from "vitest";

it("connects wallets", async () => {
  const wallet = new MockWallet([]);
  const config = defineConfig({ chains: {}, wallets: [wallet] });

  const {
    result: { status, execute },
  } = withSetup(() => useWalletConnector(), { [configKey]: config });

  expect(status.value).toBe("idle");
  expect(wallet.connected$.getValue()).toBe(false);

  await execute(wallet);

  expect(status.value).toBe("success");
  expect(wallet.connected$.getValue()).toBe(true);
});
