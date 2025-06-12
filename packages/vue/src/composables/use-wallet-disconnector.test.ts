import { configKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useWalletDisconnector } from "./use-wallet-disconnector.js";
import { defineConfig } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import { expect, it } from "vitest";

it("disconnects wallets", async () => {
  const wallet = new MockWallet([]);
  const config = defineConfig({ chains: {}, wallets: [wallet] });

  const {
    result: { status, execute },
  } = withSetup(() => useWalletDisconnector(), { [configKey]: config });

  wallet.connect();

  expect(status.value).toBe("idle");
  expect(wallet.connected$.getValue()).toBe(true);

  await execute(wallet);

  expect(status.value).toBe("success");
  expect(wallet.connected$.getValue()).toBe(false);
});
