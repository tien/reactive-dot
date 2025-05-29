import { BaseError } from "../errors.js";
import {
  Contract,
  defineContract,
  getContractConfig,
  type DescriptorOfContract,
} from "./contract.js";
import type { GenericInkDescriptors } from "./types.js";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

describe("Contract class", () => {
  it("should create a contract with the provided id", () => {
    const id = "test-id";
    const contract = new Contract(id);

    expect(contract.valueOf()).toBe(id);
  });
});

describe("defineContract function", () => {
  let mockRandomUUID: Mock;

  beforeEach(() => {
    mockRandomUUID = vi.fn().mockReturnValue("mock-uuid");
    vi.stubGlobal("crypto", {
      randomUUID: mockRandomUUID,
    });
  });

  it("should create a contract with a new UUID", () => {
    const descriptor = { type: "test" } as unknown as GenericInkDescriptors;
    const contract = defineContract({ descriptor });

    expect(mockRandomUUID).toHaveBeenCalledTimes(1);
    expect(contract.valueOf()).toBe("mock-uuid");
  });

  it("should store the config in the internal map", () => {
    const descriptor = { type: "test" } as unknown as GenericInkDescriptors;
    const contract = defineContract({ descriptor });

    const config = getContractConfig(contract);
    expect(config).toEqual({ descriptor });
  });
});

describe("getContractConfig function", () => {
  it("should return the config for a valid contract", () => {
    const descriptor = {
      type: "test-descriptor",
    } as unknown as GenericInkDescriptors;
    const contract = defineContract({ descriptor });

    const config = getContractConfig(contract);
    expect(config).toEqual({ descriptor });
  });

  it("should throw an error for an invalid contract", () => {
    const invalidContract = new Contract("non-existent");

    expect(() => getContractConfig(invalidContract)).toThrow(BaseError);
    expect(() => getContractConfig(invalidContract)).toThrow(
      "Contract non-existent not found",
    );
  });
});

describe("DescriptorOfContract type", () => {
  it("should correctly extract descriptor type from contract", () => {
    const descriptor = {
      type: "test",
      value: 123,
    } as unknown as GenericInkDescriptors;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const contract = defineContract({ descriptor });

    // This is a type check that would be validated at compile time
    // We're using a runtime test to demonstrate the relationship
    type ExpectedType = DescriptorOfContract<typeof contract>;
    const extracted: ExpectedType = descriptor; // Should compile without errors

    expect(extracted).toEqual(descriptor);
  });
});
