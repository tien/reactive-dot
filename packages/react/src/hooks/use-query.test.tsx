import { ChainProvider } from "../contexts/chain.js";
import { ReactiveDotProvider } from "../contexts/provider.js";
import { useLazyLoadQuery } from "./use-query.js";
import { defineConfig } from "@reactive-dot/core";
import { renderHook } from "@testing-library/react";
import { atom } from "jotai";
import { act, Suspense } from "react";
import { of } from "rxjs";
import { describe, expect, it, vi } from "vitest";

vi.mock("./use-typed-api.js", () => ({
  typedApiAtom: vi.fn(() =>
    atom({
      constants: {
        test_pallet: {
          test_constant: async () => "test-value",
        },
      },
      query: {
        test_pallet: {
          test_storage: {
            watchValue: (key?: unknown) =>
              of(key === undefined ? "storage-value" : `storage-value-${key}`),
          },
        },
      },
      apis: {
        test_pallet: {
          test_api: async (key?: unknown) =>
            key === undefined ? "api-value" : `api-value-${key}`,
        },
      },
    }),
  ),
}));

describe("useLazyLoadQuery", () => {
  it("fetches single queries", async () => {
    const {
      result: { current },
    } = await act(() =>
      renderHook(
        () =>
          useLazyLoadQuery((query) =>
            query.constant("test_pallet", "test_constant"),
          ),
        {
          wrapper: ({ children }) => (
            <ReactiveDotProvider config={defineConfig({ chains: {} })}>
              <ChainProvider chainId="test-chain">
                <Suspense>{children}</Suspense>
              </ChainProvider>
            </ReactiveDotProvider>
          ),
        },
      ),
    );

    expect(current).toMatchInlineSnapshot(`"test-value"`);
  });

  it("fetches multi queries", async () => {
    const {
      result: { current },
    } = await act(() =>
      renderHook(
        () =>
          useLazyLoadQuery((query) =>
            query
              .constant("test_pallet", "test_constant")
              .storage("test_pallet", "test_storage", ["key"])
              .storages("test_pallet", "test_storage", [["key1"], ["key2"]])
              .runtimeApi("test_pallet", "test_api", ["key"])
              .runtimeApis("test_pallet", "test_api", [["key1"], ["key2"]]),
          ),
        {
          wrapper: ({ children }) => (
            <ReactiveDotProvider config={defineConfig({ chains: {} })}>
              <ChainProvider chainId="test-chain">
                <Suspense>{children}</Suspense>
              </ChainProvider>
            </ReactiveDotProvider>
          ),
        },
      ),
    );

    expect(current).toMatchInlineSnapshot(`
      [
        "test-value",
        "storage-value-key",
        [
          "storage-value-key1",
          "storage-value-key2",
        ],
        "api-value-key",
        [
          "api-value-key1",
          "api-value-key2",
        ],
      ]
    `);
  });
});
