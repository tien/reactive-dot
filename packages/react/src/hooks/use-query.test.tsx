import { ChainProvider } from "../contexts/chain.js";
import { ReactiveDotProvider } from "../contexts/provider.js";
import { useLazyLoadQuery } from "./use-query.js";
import { defineConfig } from "@reactive-dot/core";
import {
  delay,
  mockedTypedApi,
  multiQueries,
  singleContractQuery,
  singleQuery,
  streamingQueries,
} from "@reactive-dot/test/tests/query.js";
import { renderHook } from "@testing-library/react";
import { atom } from "jotai";
import { act, Suspense } from "react";
import { describe, expect, it, vi } from "vitest";

await vi.hoisted(async () => {
  const { mockInternals } = await import("@reactive-dot/test/tests/query.js");
  mockInternals();
});

vi.mock("./use-typed-api.js", () => ({
  typedApiAtom: vi.fn(() => atom(mockedTypedApi)),
}));

vi.mock("./use-ink-client.js", () => ({
  inkClientAtom: vi.fn(() => atom({})),
}));

describe("useLazyLoadQuery", () => {
  it("fetches single queries", async () => {
    const {
      result: { current },
    } = await act(() =>
      renderHook(() => useLazyLoadQuery(singleQuery), {
        wrapper: ({ children }) => (
          <ReactiveDotProvider config={defineConfig({ chains: {} })}>
            <ChainProvider chainId="test-chain">
              <Suspense>{children}</Suspense>
            </ChainProvider>
          </ReactiveDotProvider>
        ),
      }),
    );

    expect(current).toMatchInlineSnapshot(`"test-value"`);
  });

  it("fetches single contract queries", async () => {
    const {
      result: { current },
    } = await act(() =>
      renderHook(() => useLazyLoadQuery(singleContractQuery), {
        wrapper: ({ children }) => (
          <ReactiveDotProvider config={defineConfig({ chains: {} })}>
            <ChainProvider chainId="test-chain">
              <Suspense>{children}</Suspense>
            </ChainProvider>
          </ReactiveDotProvider>
        ),
      }),
    );

    expect(current).toMatchInlineSnapshot(`
      [
        "contract-0x",
        {
          "instruction": "read-storage",
          "path": "",
        },
      ]
    `);
  });

  it("fetches multi queries", async () => {
    const {
      result: { current },
    } = await act(() =>
      renderHook(() => useLazyLoadQuery(multiQueries), {
        wrapper: ({ children }) => (
          <ReactiveDotProvider config={defineConfig({ chains: {} })}>
            <ChainProvider chainId="test-chain">
              <Suspense>{children}</Suspense>
            </ChainProvider>
          </ReactiveDotProvider>
        ),
      }),
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
        [
          [
            "contract-0x",
            {
              "instruction": "read-storage",
              "path": "",
            },
          ],
          [
            "contract-0x",
            {
              "instruction": "read-storage",
              "key": "test_key",
              "path": "test_storage",
            },
          ],
          [
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "key": "test_key1",
                "path": "test_storage",
              },
            ],
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "key": "test_key2",
                "path": "test_storage",
              },
            ],
          ],
          [
            "contract-0x",
            {
              "body": {
                "data": "test-data",
              },
              "instruction": "send-message",
              "name": "test_message",
            },
          ],
          [
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data1",
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data2",
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
          ],
          [
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data1",
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data2",
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
          ],
        ],
        [
          [
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "path": "",
              },
            ],
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "key": "test_key",
                "path": "test_storage",
              },
            ],
            [
              [
                "contract-0x",
                {
                  "instruction": "read-storage",
                  "key": "test_key1",
                  "path": "test_storage",
                },
              ],
              [
                "contract-0x",
                {
                  "instruction": "read-storage",
                  "key": "test_key2",
                  "path": "test_storage",
                },
              ],
            ],
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data",
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              [
                "contract-0x",
                {
                  "body": {
                    "data": "test-data1",
                  },
                  "instruction": "send-message",
                  "name": "test_message",
                },
              ],
              [
                "contract-0x",
                {
                  "body": {
                    "data": "test-data2",
                  },
                  "instruction": "send-message",
                  "name": "test_message",
                },
              ],
            ],
          ],
          [
            [
              "contract-0x1",
              {
                "instruction": "read-storage",
                "path": "",
              },
            ],
            [
              "contract-0x1",
              {
                "instruction": "read-storage",
                "key": "test_key",
                "path": "test_storage",
              },
            ],
            [
              [
                "contract-0x1",
                {
                  "instruction": "read-storage",
                  "key": "test_key1",
                  "path": "test_storage",
                },
              ],
              [
                "contract-0x1",
                {
                  "instruction": "read-storage",
                  "key": "test_key2",
                  "path": "test_storage",
                },
              ],
            ],
            [
              "contract-0x1",
              {
                "body": {
                  "data": "test-data",
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              [
                "contract-0x1",
                {
                  "body": {
                    "data": "test-data1",
                  },
                  "instruction": "send-message",
                  "name": "test_message",
                },
              ],
              [
                "contract-0x1",
                {
                  "body": {
                    "data": "test-data2",
                  },
                  "instruction": "send-message",
                  "name": "test_message",
                },
              ],
            ],
          ],
        ],
      ]
    `);
  });

  it("streams responses", async () => {
    const { result } = await act(() =>
      renderHook(() => useLazyLoadQuery(streamingQueries), {
        wrapper: ({ children }) => (
          <ReactiveDotProvider config={defineConfig({ chains: {} })}>
            <ChainProvider chainId="test-chain">
              <Suspense>{children}</Suspense>
            </ChainProvider>
          </ReactiveDotProvider>
        ),
      }),
    );

    expect(result.current).toMatchInlineSnapshot(`
      [
        [
          Symbol(pending),
          Symbol(pending),
        ],
        [
          Symbol(pending),
          Symbol(pending),
        ],
        [
          [
            Symbol(pending),
            Symbol(pending),
          ],
          [
            Symbol(pending),
            Symbol(pending),
          ],
        ],
        [
          Symbol(pending),
          Symbol(pending),
        ],
        [
          Symbol(pending),
          Symbol(pending),
        ],
      ]
    `);

    await act(() => delay.resolve());
    await delay.promise;

    expect(result.current).toMatchInlineSnapshot(`
      [
        [
          "storage-value",
          "storage-value",
        ],
        [
          "api-value-Symbol(delay)",
          "api-value-Symbol(delay)",
        ],
        [
          [
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
          ],
          [
            [
              "contract-0x",
              {
                "body": Symbol(delay),
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              "contract-0x",
              {
                "body": Symbol(delay),
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
          ],
        ],
        [
          [
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
          ],
          [
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
          ],
        ],
        [
          [
            [
              [
                "contract-0x",
                {
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
            [
              [
                "contract-0x",
                {
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
          ],
          [
            [
              [
                "contract-0x",
                {
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
            [
              [
                "contract-0x",
                {
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
          ],
        ],
      ]
    `);
  });
});
