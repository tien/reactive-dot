import { chainIdKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useQuery } from "./use-query.js";
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

describe("useQuery", () => {
  it("fetches single queries", async () => {
    const { result } = withSetup(
      () => useQuery((query) => query.constant("test_pallet", "test_constant")),
      { [chainIdKey]: "test-chain" },
    );

    const data = (await result).data;

    expect(data.value).toMatchInlineSnapshot(`"test-value"`);
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
            .runtimeApis("test_pallet", "test_api", [["key1"], ["key2"]]),
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
      ]
    `);
  });
});
