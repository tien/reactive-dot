import { QueryError } from "../errors.js";
import type { SimpleInkQueryInstruction } from "./query-builder.js";
import { queryInk } from "./query.js";
import { beforeEach, expect, it, vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let api: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any;
const address = "0xdeadbeef";

beforeEach(() => {
  api = {
    apis: {
      ReviveApi: {
        get_storage_var_key: vi.fn(),
        call: vi.fn(),
      },
    },
  };

  client = {
    storage: vi.fn().mockReturnValue({
      encode: vi.fn().mockReturnValue("encodedKey"),
      decode: vi.fn().mockReturnValue(42),
    }),
    message: vi.fn().mockReturnValue({
      attributes: { mutates: false },
      encode: vi.fn().mockReturnValue("encodedMsg"),
      decode: vi.fn().mockReturnValue({ Ok: "okValue" }),
    }),
  };
});

it("reads a non-empty storage value", async () => {
  api.apis.ReviveApi.get_storage_var_key.mockResolvedValue({
    success: true,
    value: new Uint8Array([1, 2, 3]),
  });

  const result = await queryInk(api, client, address, {
    instruction: "read-storage",
    path: "",
    key: "foo",
  } as SimpleInkQueryInstruction);

  expect(client.storage).toHaveBeenCalledWith();
  expect(client.storage().encode).toHaveBeenCalledWith("foo");
  expect(api.apis.ReviveApi.get_storage_var_key).toHaveBeenCalled();
  expect(result).toBe(42);
});

it("returns undefined when storage value is absent", async () => {
  api.apis.ReviveApi.get_storage_var_key.mockResolvedValue({
    success: true,
    value: undefined,
  });

  const result = await queryInk(api, client, address, {
    instruction: "read-storage",
    path: "myPath",
    key: "foo",
  } as SimpleInkQueryInstruction);

  expect(client.storage).toHaveBeenCalledWith("myPath");
  expect(result).toBeUndefined();
});

it("throws QueryError on storage fetch failure", async () => {
  const err = { type: "NoSuchKey", message: "not found" };
  api.apis.ReviveApi.get_storage_var_key.mockResolvedValue({
    success: false,
    value: err,
  });

  await expect(() =>
    queryInk(api, client, address, {
      instruction: "read-storage",
      path: "",
      key: "foo",
    } as SimpleInkQueryInstruction),
  ).rejects.throws(QueryError);
});

it("throws when send-message is mutating", async () => {
  client.message.mockReturnValue({ attributes: { mutates: true } });

  await expect(() =>
    queryInk(api, client, address, {
      instruction: "send-message",
      name: "doMutate",
      body: {},
    } as SimpleInkQueryInstruction),
  ).rejects.throws(QueryError);
});

it("throws QueryError when send-message call fails", async () => {
  client.message.mockReturnValue({
    attributes: { mutates: false },
    encode: vi.fn().mockReturnValue("msg"),
  });

  api.apis.ReviveApi.call.mockResolvedValue({
    result: { success: false, value: { message: "err" } },
  });

  await expect(() =>
    queryInk(api, client, address, {
      instruction: "send-message",
      name: "foo",
      body: {},
    } as SimpleInkQueryInstruction),
  ).rejects.throws(QueryError);
});
