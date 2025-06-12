import { configKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useConnectedWallets, useWallets } from "./use-wallets.js";
import { defineConfig } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import { expect, it } from "vitest";

it("fetches wallets from the config", async () => {
  const wallets = [new MockWallet([]), new MockWallet([])];
  const config = defineConfig({ chains: {}, wallets });

  const { result } = withSetup(() => useWallets(), {
    [configKey]: config,
  });

  const value = await result;

  expect(value.data.value).toEqual(wallets);
});

it("fetches connected wallets", async () => {
  const wallets = [new MockWallet([]), new MockWallet([])] as const;
  const config = defineConfig({ chains: {}, wallets });

  const { result } = withSetup(() => useConnectedWallets(), {
    [configKey]: config,
  });

  const data = (await result).data;

  expect(data.value).toHaveLength(0);

  wallets[0].connect();

  expect(data.value).toHaveLength(1);
  expect(data.value[0]).toBe(wallets[0]);
});
