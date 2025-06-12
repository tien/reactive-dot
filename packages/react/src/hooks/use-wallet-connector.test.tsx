import { ReactiveDotProvider } from "../contexts/provider.js";
import { useWalletConnector } from "./use-wallet-connector.js";
import { defineConfig, idle } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { expect, it } from "vitest";

it("connects wallets", async () => {
  const wallet = new MockWallet([]);
  const config = defineConfig({ chains: {}, wallets: [wallet] });

  const {
    result: {
      current: [status, connect],
    },
  } = await act(() =>
    renderHook(() => useWalletConnector(), {
      wrapper: ({ children }) => (
        <ReactiveDotProvider config={config}>
          <Suspense>{children}</Suspense>
        </ReactiveDotProvider>
      ),
    }),
  );

  expect(status).toBe(idle);
  expect(wallet.connected$.getValue()).toBe(false);

  await act(() => connect(wallet));

  waitFor(() => expect(status).toBeTruthy());
  expect(wallet.connected$.getValue()).toBe(true);
});
