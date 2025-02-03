import type { QueryInstruction } from "../query-builder.js";
import { preflight, query } from "./query.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import { describe, it, expect } from "vitest";

const dummyValue = { result: "dummy" };

const fakeApi = {
  constants: {
    test: {
      foo: () => dummyValue,
    },
  },
  apis: {
    test: {
      foo: (...args: unknown[]) => ({ args, ...dummyValue }),
    },
  },
  query: {
    test: {
      foo: {
        getValue: (...args: unknown[]) => ({
          method: "getValue",
          args,
          ...dummyValue,
        }),
        watchValue: (...args: unknown[]) => ({
          method: "watchValue",
          args,
          ...dummyValue,
        }),
        getEntries: (...args: unknown[]) => ({
          method: "getEntries",
          args,
          ...dummyValue,
        }),
      },
    },
  },
} as unknown as TypedApi<ChainDefinition>;

describe("preflight", () => {
  it('should return "promise" for get-constant instruction', () => {
    const instruction = {
      instruction: "get-constant",
      pallet: "test",
      constant: "foo",
    } as QueryInstruction;

    expect(preflight(instruction)).toBe("promise");
  });

  it('should return "promise" for call-api instruction', () => {
    const instruction = {
      instruction: "call-api",
      pallet: "test",
      api: "foo",
      args: [],
    } as QueryInstruction;

    expect(preflight(instruction)).toBe("promise");
  });

  it('should return "promise" for read-storage-entries instruction', () => {
    const instruction = {
      instruction: "read-storage-entries",
      pallet: "test",
      storage: "foo",
      args: [],
    } as QueryInstruction;

    expect(preflight(instruction)).toBe("promise");
  });

  it('should return "observable" for read-storage instruction', () => {
    const instruction = {
      instruction: "read-storage",
      pallet: "test",
      storage: "foo",
      args: [],
    } as QueryInstruction;

    expect(preflight(instruction)).toBe("observable");
  });

  it('should return "promise" if "at" is provided and starts with "0x"', () => {
    const instruction = {
      instruction: "read-storage",
      pallet: "test",
      storage: "foo",
      args: [1],
      at: "0x1234",
    } as QueryInstruction;

    expect(preflight(instruction)).toBe("promise");
  });
});

it('should handle "get-constant" instruction', () => {
  const instruction = {
    instruction: "get-constant",
    pallet: "test",
    constant: "foo",
  } as QueryInstruction;

  const result = query(fakeApi, instruction);

  expect(result).toEqual(dummyValue);
});

it('should handle "call-api" instruction', () => {
  const instruction = {
    instruction: "call-api",
    pallet: "test",
    api: "foo",
    args: [1, 2],
  } as QueryInstruction;

  const result = query(fakeApi, instruction, { signal: undefined });

  expect(result).toEqual({
    args: [1, 2, { signal: undefined, at: undefined }],
    ...dummyValue,
  });
});

it('should handle "read-storage" instruction with at starting with "0x" (using getValue)', () => {
  const instruction = {
    instruction: "read-storage",
    pallet: "test",
    storage: "foo",
    args: [3],
    at: "0xabc",
  } as QueryInstruction;

  const result = query(fakeApi, instruction);

  expect(result).toEqual({
    method: "getValue",
    args: [3, { at: "0xabc" }],
    ...dummyValue,
  });
});

it('should handle "read-storage" instruction without at or non-hex at (using watchValue)', () => {
  const instruction = {
    instruction: "read-storage",
    pallet: "test",
    storage: "foo",
    args: [3],
  } as QueryInstruction;

  const result = query(fakeApi, instruction);

  // When instruction.at is undefined, watchValue is called with only the provided args.
  expect(result).toEqual({ method: "watchValue", args: [3], ...dummyValue });
});

it('should handle "read-storage-entries" instruction', () => {
  const instruction = {
    instruction: "read-storage-entries",
    pallet: "test",
    storage: "foo",
    args: [],
  } as QueryInstruction;

  const result = query(fakeApi, instruction);

  expect(result).toEqual({
    method: "getEntries",
    args: [{ signal: undefined, at: undefined }],
    ...dummyValue,
  });
});
