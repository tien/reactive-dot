import { defineContract } from "./ink/contract.js";
import type { InkQuery } from "./ink/query-builder.js";
import type { GenericInkDescriptors } from "./ink/types.js";
import { Query } from "./query-builder.js";
import { expect, it } from "vitest";

it("should append a get-constant instruction", () => {
  const query = new Query();
  const newQuery = query.constant("TestPallet", "TestConstant");
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toEqual({
    instruction: "get-constant",
    pallet: "TestPallet",
    constant: "TestConstant",
  });
});

it("should append a read-storage instruction", () => {
  const query = new Query();
  const newQuery = query.storage("TestPallet", "TestStorage", ["arg1"], {
    at: "finalized",
  });
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toMatchInlineSnapshot(`
    {
      "args": [
        "arg1",
      ],
      "at": "finalized",
      "instruction": "read-storage",
      "pallet": "TestPallet",
      "storage": "TestStorage",
    }
  `);
});

it("should append a multi read-storage instruction using storages", () => {
  const query = new Query();
  const newQuery = query.storages("TestPallet", "TestStorage", [
    ["arg1"],
    ["arg2"],
  ]);
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toMatchInlineSnapshot(`
    {
      "args": [
        [
          "arg1",
        ],
        [
          "arg2",
        ],
      ],
      "at": undefined,
      "directives": {
        "stream": undefined,
      },
      "instruction": "read-storage",
      "multi": true,
      "pallet": "TestPallet",
      "storage": "TestStorage",
    }
  `);
});

it("should append a read-storage-entries instruction", () => {
  const query = new Query();
  const newQuery = query.storageEntries("TestPallet", "TestStorage", ["arg1"], {
    at: "best",
  });
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toMatchInlineSnapshot(`
    {
      "args": [
        "arg1",
      ],
      "at": "best",
      "instruction": "read-storage-entries",
      "pallet": "TestPallet",
      "storage": "TestStorage",
    }
  `);
});

it("should append a call-api instruction", () => {
  const query = new Query();
  const newQuery = query.runtimeApi("TestPallet", "TestApi", ["arg1"], {
    at: "best",
  });
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toMatchInlineSnapshot(`
    {
      "api": "TestApi",
      "args": [
        "arg1",
      ],
      "at": "best",
      "instruction": "call-api",
      "pallet": "TestPallet",
    }
  `);
});

it("should append a multi call-api instruction using runtimeApis", () => {
  const query = new Query();
  const newQuery = query.runtimeApis(
    "TestPallet",
    "TestApi",
    [["arg1"], ["arg2"]],
    { at: "finalized" },
  );
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toMatchInlineSnapshot(`
    {
      "api": "TestApi",
      "args": [
        [
          "arg1",
        ],
        [
          "arg2",
        ],
      ],
      "at": "finalized",
      "directives": {
        "stream": undefined,
      },
      "instruction": "call-api",
      "multi": true,
      "pallet": "TestPallet",
    }
  `);
});

const mockContractDescriptor = {} as unknown as GenericInkDescriptors;

const mockContract = defineContract({ descriptor: mockContractDescriptor });

const mockInkQueryBuilder = (
  query: InkQuery<typeof mockContractDescriptor, []>,
) => {
  return query.message("testMessage", {});
};

it("should append a read-contract instruction", () => {
  const query = new Query();
  const newQuery = query.contract(
    mockContract,
    "contractAddress123",
    mockInkQueryBuilder,
  );
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toMatchInlineSnapshot(`
    {
      "address": "contractAddress123",
      "contract": Contract {},
      "instruction": "read-contract",
      "instructions": [
        {
          "at": undefined,
          "body": {},
          "instruction": "send-message",
          "name": "testMessage",
        },
      ],
    }
  `);
});

it("should append a multi read-contract instruction using contracts", () => {
  const query = new Query();
  const newQuery = query.contracts(
    mockContract,
    ["address1", "address2"],
    mockInkQueryBuilder,
  );
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toMatchInlineSnapshot(`
    {
      "addresses": [
        "address1",
        "address2",
      ],
      "contract": Contract {},
      "directives": {
        "stream": undefined,
      },
      "instruction": "read-contract",
      "instructions": [
        {
          "at": undefined,
          "body": {},
          "instruction": "send-message",
          "name": "testMessage",
        },
      ],
      "multi": true,
    }
  `);
});

it("should return a frozen instructions array", () => {
  const query = new Query();
  const instructions = query.instructions;

  expect(Object.isFrozen(instructions)).toBe(true);
});

it("should concatenate two queries", () => {
  const query1 = new Query().constant("TestPallet", "TestConstant");
  const query2 = new Query().storage("TestPallet", "TestStorage", []);
  const query3 = new Query().runtimeApi("TestPallet", "TestApi", []);

  const concatenated = query1.concat(query2, query3);
  const instructions = concatenated.instructions;

  expect(instructions).toHaveLength(3);
  expect(instructions[0]).toMatchObject({
    instruction: "get-constant",
    pallet: "TestPallet",
    constant: "TestConstant",
  });
  expect(instructions[1]).toMatchObject({
    instruction: "read-storage",
    pallet: "TestPallet",
    storage: "TestStorage",
  });
  expect(instructions[2]).toMatchObject({
    instruction: "call-api",
    pallet: "TestPallet",
    api: "TestApi",
  });
});
