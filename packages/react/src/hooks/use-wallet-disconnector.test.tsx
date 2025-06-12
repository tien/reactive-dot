import { ReactiveDotProvider } from "../contexts/provider.js";
import { useWalletDisconnector } from "./use-wallet-disconnector.js";
import { defineConfig, idle } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { expect, it } from "vitest";

it("disconnects wallets", async () => {
  const wallet = new MockWallet([]);
  const config = defineConfig({ chains: {}, wallets: [wallet] });

  const {
    result: {
      current: [status, disconnect],
    },
  } = await act(() =>
    renderHook(() => useWalletDisconnector(), {
      wrapper: ({ children }) => (
        <ReactiveDotProvider config={config}>
          <Suspense>{children}</Suspense>
        </ReactiveDotProvider>
      ),
    }),
  );

  wallet.connect();

  expect(status).toBe(idle);
  expect(wallet.connected$.getValue()).toBe(true);

  await act(() => disconnect(wallet));

  waitFor(() => expect(status).toBeTruthy());
  expect(wallet.connected$.getValue()).toBe(false);
});
