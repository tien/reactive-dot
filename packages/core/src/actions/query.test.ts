import type { QueryInstruction } from "../query-builder.js";
import { preflight, query } from "./query.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import { of, firstValueFrom } from "rxjs";
import { describe, it, expect } from "vitest";

const dummyValue = { result: "dummy" };

const fakeApi = {
  constants: {
    test: {
      foo: () => Promise.resolve(dummyValue),
    },
  },
  apis: {
    test: {
      foo: (...args: unknown[]) => Promise.resolve({ args, ...dummyValue }),
    },
  },
  query: {
    test: {
      foo: {
        getValue: (...args: unknown[]) =>
          Promise.resolve({
            method: "getValue",
            args,
            ...dummyValue,
          }),
        watchValue: (...args: unknown[]) =>
          of({
            method: "watchValue",
            args,
            ...dummyValue,
          }),
        getEntries: (..._: unknown[]) =>
          Promise.resolve([{ keyArgs: "foo", value: "bar" }]),
        watchEntries: (..._: unknown[]) =>
          of({ entries: [{ args: "foo", value: "bar" }] }),
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

  it('should return "observable" for read-storage-entries instruction', () => {
    const instruction = {
      instruction: "read-storage-entries",
      pallet: "test",
      storage: "foo",
      args: [],
    } as QueryInstruction;

    expect(preflight(instruction)).toBe("observable");
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

it('should handle "get-constant" instruction', async () => {
  const instruction = {
    instruction: "get-constant",
    pallet: "test",
    constant: "foo",
  } as QueryInstruction;

  const result = await query(fakeApi, instruction);

  expect(result).toEqual(dummyValue);
});

it('should handle "call-api" instruction', async () => {
  const instruction = {
    instruction: "call-api",
    pallet: "test",
    api: "foo",
    args: [1, 2],
  } as QueryInstruction;

  const result = await query(fakeApi, instruction);

  expect(result).toEqual({
    args: [1, 2, { signal: undefined, at: undefined }],
    ...dummyValue,
  });
});

it('should handle "read-storage" instruction with at starting with "0x" (using getValue)', async () => {
  const instruction = {
    instruction: "read-storage",
    pallet: "test",
    storage: "foo",
    args: [3],
    at: "0xabc",
  } as QueryInstruction;

  const result = await query(fakeApi, instruction);

  expect(result).toEqual({
    method: "getValue",
    args: [3, { at: "0xabc" }],
    ...dummyValue,
  });
});

it('should handle "read-storage" instruction without at or non-hex at (using watchValue)', async () => {
  const instruction = {
    instruction: "read-storage",
    pallet: "test",
    storage: "foo",
    args: [3],
  } as QueryInstruction;

  const result = await firstValueFrom(
    // @ts-expect-error this is an observable
    query(fakeApi, instruction),
  );

  expect(result).toEqual({ method: "watchValue", args: [3], ...dummyValue });
});

it('should handle "read-storage-entries" instruction with at starting with "0x" (using getEntries)', async () => {
  const instruction = {
    instruction: "read-storage-entries",
    pallet: "test",
    storage: "foo",
    args: [3],
    at: "0xabc",
  } as QueryInstruction;

  const result = await query(fakeApi, instruction);

  expect(result).toMatchObject([
    Object.assign(["foo", "bar"], { keyArgs: "foo", value: "bar" }),
  ]);
});

it('should handle "read-storage-entries" instruction without at or non-hex at (using watchEntries)', async () => {
  const instruction = {
    instruction: "read-storage-entries",
    pallet: "test",
    storage: "foo",
    args: [3],
  } as QueryInstruction;

  const result = await firstValueFrom(
    // @ts-expect-error this is an observable
    query(fakeApi, instruction),
  );

  expect(result).toMatchObject([
    Object.assign(["foo", "bar"], { keyArgs: "foo", value: "bar" }),
  ]);
});
