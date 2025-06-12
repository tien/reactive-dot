import { ReactiveDotProvider } from "../contexts/provider.js";
import { useWalletsInitializer } from "./use-wallets-initializer.js";
import { defineConfig, idle } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { expect, it } from "vitest";

it("initializes wallets from the config", async () => {
  const wallet = new MockWallet([]);
  const config = defineConfig({ chains: {}, wallets: [wallet] });

  const {
    result: {
      current: [status, initialize],
    },
  } = await act(() =>
    renderHook(() => useWalletsInitializer(), {
      wrapper: ({ children }) => (
        <ReactiveDotProvider config={config}>
          <Suspense>{children}</Suspense>
        </ReactiveDotProvider>
      ),
    }),
  );

  expect(status).toBe(idle);
  expect(wallet.initialized$.getValue()).toBe(true);

  await act(() => initialize());

  waitFor(() => expect(status).toBeTruthy());
  expect(wallet.initialized$.getValue()).toBe(true);
});
