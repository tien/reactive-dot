import { ReactiveDotProvider } from "../contexts/provider.js";
import { useConnectedWallets, useWallets } from "./use-wallets.js";
import { defineConfig } from "@reactive-dot/core";
import { MockWallet } from "@reactive-dot/test";
import { act, renderHook } from "@testing-library/react";
import { Suspense } from "react";
import { expect, it } from "vitest";

it("fetches wallets from the config", async () => {
  const wallets = [new MockWallet([]), new MockWallet([])];
  const config = defineConfig({ chains: {}, wallets });

  const { result } = await act(() =>
    renderHook(() => useWallets(), {
      wrapper: ({ children }) => (
        <ReactiveDotProvider config={config}>
          <Suspense>{children}</Suspense>
        </ReactiveDotProvider>
      ),
    }),
  );

  expect(result.current).toEqual(wallets);
});

it("fetches connected wallets", async () => {
  const wallets = [new MockWallet([]), new MockWallet([])];
  const config = defineConfig({ chains: {}, wallets });

  const { result } = await act(() =>
    renderHook(() => useConnectedWallets(), {
      wrapper: ({ children }) => (
        <ReactiveDotProvider config={config}>
          <Suspense>{children}</Suspense>
        </ReactiveDotProvider>
      ),
    }),
  );

  expect(result.current).toHaveLength(0);

  await act(() => wallets[0]!.connect());

  expect(result.current).toHaveLength(1);
  expect(result.current[0]).toBe(wallets[0]);
});
