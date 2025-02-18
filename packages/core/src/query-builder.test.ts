import { Query } from "./query-builder.js";
import { expect, it } from "vitest";

it("should append a get-constant instruction", () => {
  const query = new Query();
  const newQuery = query.getConstant("TestPallet", "TestConstant");
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
  const newQuery = query.readStorage("TestPallet", "TestStorage", ["arg1"], {
    at: "finalized",
  });
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toEqual({
    instruction: "read-storage",
    pallet: "TestPallet",
    storage: "TestStorage",
    args: ["arg1"],
    at: "finalized",
  });
});

it("should append a multi read-storage instruction using readStorages", () => {
  const query = new Query();
  const newQuery = query.readStorages(
    "TestPallet",
    "TestStorage",
    [["arg1"], ["arg2"]],
    { at: undefined },
  );
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toEqual({
    instruction: "read-storage",
    pallet: "TestPallet",
    storage: "TestStorage",
    args: [["arg1"], ["arg2"]],
    at: undefined,
    multi: true,
  });
});

it("should append a read-storage-entries instruction", () => {
  const query = new Query();
  const newQuery = query.readStorageEntries(
    "TestPallet",
    "TestStorage",
    ["arg1"],
    { at: "best" },
  );
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toEqual({
    instruction: "read-storage-entries",
    pallet: "TestPallet",
    storage: "TestStorage",
    args: ["arg1"],
    at: "best",
  });
});

it("should append a call-api instruction", () => {
  const query = new Query();
  const newQuery = query.callApi("TestPallet", "TestApi", ["arg1"], {
    at: "best",
  });
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toEqual({
    instruction: "call-api",
    pallet: "TestPallet",
    api: "TestApi",
    args: ["arg1"],
    at: "best",
  });
});

it("should append a multi call-api instruction using callApis", () => {
  const query = new Query();
  const newQuery = query.callApis(
    "TestPallet",
    "TestApi",
    [["arg1"], ["arg2"]],
    { at: "finalized" },
  );
  const instructions = newQuery.instructions;

  expect(instructions).toHaveLength(1);
  expect(instructions[0]).toEqual({
    instruction: "call-api",
    pallet: "TestPallet",
    api: "TestApi",
    args: [["arg1"], ["arg2"]],
    at: "finalized",
    multi: true,
  });
});

it("should return a frozen instructions array", () => {
  const query = new Query();
  const instructions = query.instructions;

  expect(Object.isFrozen(instructions)).toBe(true);
});

it("should concatenate two queries", () => {
  const query1 = new Query().getConstant("TestPallet", "TestConstant");
  const query2 = new Query().readStorage("TestPallet", "TestStorage", []);
  const query3 = new Query().callApi("TestPallet", "TestApi", []);

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
