import { defineContract, Query } from "@reactive-dot/core";
import type { SimpleInkQueryInstruction } from "@reactive-dot/core/internal.js";
import { from, of } from "rxjs";
import { map } from "rxjs";
import { vi } from "vitest";

export const delay = Promise.withResolvers<void>();

export const delayKey = Symbol("delay");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testContract = defineContract({ descriptor: {} as any });

export const mockedTypedApi = {
  constants: {
    test_pallet: {
      test_constant: async () => "test-value",
    },
  },
  query: {
    test_pallet: {
      test_storage: {
        watchValue: (key?: unknown) => {
          if (key === delayKey) {
            return from(delay.promise).pipe(map(() => "storage-value"));
          }

          return of(
            key === undefined
              ? "storage-value"
              : `storage-value-${String(key)}`,
          );
        },
      },
    },
  },
  apis: {
    test_pallet: {
      test_api: async (key?: unknown) => {
        if (key === delayKey) {
          await delay.promise;
        }

        return key === undefined ? "api-value" : `api-value-${String(key)}`;
      },
    },
  },
};

export function mockInternals() {
  vi.doMock(
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
        ) => {
          if (Object.values(instruction).includes(delayKey)) {
            await delay.promise;
          }

          return [
            `contract-${address}`,
            Object.fromEntries(
              Object.entries(instruction).filter(
                ([_, value]) => value !== undefined,
              ),
            ),
          ];
        },
      ),
    }),
  );
}

export const singleQuery = new Query().constant(
  "test_pallet",
  "test_constant",
) as Query;

export const singleContractQuery = new Query().contract(
  testContract,
  "0x",
  (query) => query.rootStorage(),
) as Query;

export const multiQueries = new Query()
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
      ])
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
  ) as Query;

export const streamingQueries = new Query()
  .storages("test_pallet", "test_storage", [[delayKey], [delayKey]], {
    stream: true,
  })
  .runtimeApis("test_pallet", "test_api", [[delayKey], [delayKey]], {
    stream: true,
  })
  .contract(testContract, "0x", (query) =>
    query
      .storages("test_storage", [delayKey, delayKey], {
        stream: true,
      })
      .messages("test_message", [delayKey, delayKey], {
        stream: true,
      }),
  )
  .contracts(
    testContract,
    ["0x", "0x"],
    (query) => query.storages("test_storage", [delayKey]),
    { stream: true },
  )
  .contracts(
    testContract,
    ["0x", "0x"],
    (query) =>
      query
        .storages("test_storage", [delayKey])
        .storages("test_storage", [delayKey]),
    { stream: true },
  ) as Query;
