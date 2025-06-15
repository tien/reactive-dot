import { chainIdKey, configKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useAccounts } from "./use-accounts.js";
import { type ChainConfig, defineConfig } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import type { PolkadotSigner } from "polkadot-api";
import { expect, it, vi } from "vitest";
import { computed } from "vue";

vi.mock("./use-chain-spec-data.js", () => ({
  useChainSpecDataPromise: vi.fn(() => computed(() => undefined)),
}));

it("returns accounts from connected wallets", async () => {
  const wallets = [
    new MockWallet(
      [
        {
          id: "1",
          polkadotSigner: { publicKey: new Uint8Array() } as PolkadotSigner,
        },
        {
          id: "2",
          polkadotSigner: { publicKey: new Uint8Array() } as PolkadotSigner,
        },
      ],
      true,
    ),
    new MockWallet(
      [
        {
          id: "3",
          polkadotSigner: { publicKey: new Uint8Array() } as PolkadotSigner,
        },
        {
          id: "4",
          polkadotSigner: { publicKey: new Uint8Array() } as PolkadotSigner,
        },
      ],
      true,
    ),
  ];

  const config = defineConfig({
    chains: { "test-chain": {} as ChainConfig },
    wallets,
  });

  const { result } = withSetup(() => useAccounts(), {
    [configKey]: config,
    [chainIdKey]: "test-chain",
  });

  const data = (await result).data;

  expect(data.value).toEqual([
    expect.objectContaining({ id: "1" }),
    expect.objectContaining({ id: "2" }),
    expect.objectContaining({ id: "3" }),
    expect.objectContaining({ id: "4" }),
  ]);
});
