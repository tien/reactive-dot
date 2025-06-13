import { chainIdKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useQuery } from "./use-query.js";
import { defineContract } from "@reactive-dot/core";
import type { SimpleInkQueryInstruction } from "@reactive-dot/core/internal.js";
import { of } from "rxjs";
import { describe, expect, it, vi } from "vitest";

vi.mock("./use-typed-api.js", () => ({
  useTypedApiPromise: vi.fn(async () => ({
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
  })),
}));

vi.mock(
  "@reactive-dot/core/internal/actions.js",
  async (getOriginalModule) => ({
    ...(await getOriginalModule()),
    getInkClient: vi.fn(),
    queryInk: vi.fn(
      async (
        _,
        __,
        address: string,
        instruction: SimpleInkQueryInstruction,
      ) => [
        `contract-${address}`,
        Object.fromEntries(
          Object.entries(instruction).filter(
            ([_, value]) => value !== undefined,
          ),
        ),
      ],
    ),
  }),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testContract = defineContract({ descriptor: {} as any });

describe("useQuery", () => {
  it("fetches single queries", async () => {
    const { result } = withSetup(
      () => useQuery((query) => query.constant("test_pallet", "test_constant")),
      { [chainIdKey]: "test-chain" },
    );

    const data = (await result).data;

    expect(data.value).toMatchInlineSnapshot(`"test-value"`);
  });

  it("fetches single contract queries", async () => {
    const { result } = withSetup(
      () =>
        useQuery((query) =>
          query.contract(testContract, "0x", (query) => query.rootStorage()),
        ),
      { [chainIdKey]: "test-chain" },
    );

    const data = (await result).data;

    expect(data.value).toMatchInlineSnapshot(`
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
    const { result } = withSetup(
      () =>
        useQuery((query) =>
          query
            .constant("test_pallet", "test_constant")
            .storage("test_pallet", "test_storage", ["key"])
            .storages("test_pallet", "test_storage", [["key1"], ["key2"]])
            .runtimeApi("test_pallet", "test_api", ["key"])
            .runtimeApis("test_pallet", "test_api", [["key1"], ["key2"]])
            .contract(testContract, "0x", (query) =>
              query
                .rootStorage()
                .storage("test_storage", "test_key")
                .storages("test_storage", ["test_key1", "test_key2"])
                .message("test_message", { data: "test-data" })
                .messages("test_message", [
                  { data: "test-data1" },
                  { data: "test-data2" },
                ]),
            )
            .contracts(testContract, ["0x", "0x1"], (query) =>
              query
                .rootStorage()
                .storage("test_storage", "test_key")
                .storages("test_storage", ["test_key1", "test_key2"])
                .message("test_message", { data: "test-data" })
                .messages("test_message", [
                  { data: "test-data1" },
                  { data: "test-data2" },
                ]),
            ),
        ),
      { [chainIdKey]: "test-chain" },
    );

    const data = (await result).data;

    expect(data.value).toMatchInlineSnapshot(`
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
        ],
      ]
    `);
  });
});
