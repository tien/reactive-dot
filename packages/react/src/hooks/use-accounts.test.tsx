import { ReactiveDotProvider } from "../contexts/provider.js";
import { useAccounts } from "./use-accounts.js";
import { defineConfig } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import { act, renderHook } from "@testing-library/react";
import type { PolkadotSigner } from "polkadot-api";
import { Suspense } from "react";
import { expect, it } from "vitest";

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
  ] as const;

  const config = defineConfig({ chains: {}, wallets });

  const { result } = await act(() =>
    renderHook(() => useAccounts(), {
      wrapper: ({ children }) => (
        <ReactiveDotProvider config={config}>
          <Suspense>{children}</Suspense>
        </ReactiveDotProvider>
      ),
    }),
  );

  expect(result.current).toEqual([
    expect.objectContaining({ id: "1" }),
    expect.objectContaining({ id: "2" }),
    expect.objectContaining({ id: "3" }),
    expect.objectContaining({ id: "4" }),
  ]);
});
