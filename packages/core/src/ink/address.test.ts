import { toH160Bytes, toSs58Address } from "./address.js";
import { FixedSizeBinary, AccountId } from "polkadot-api";
import { describe, it, expect } from "vitest";

const ss58Alice = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice's address (default/format 42)
const h160HexForAliceSs58Derived = "0x9621dde636de098b43efb0fa9b61facfe328f99d";

const genericH160Hex = "0x1234567890123456789012345678901234567890";
const genericH160FixedBinary = FixedSizeBinary.fromHex(genericH160Hex);

const genericPaddedBytes = new Uint8Array(32);
genericPaddedBytes.set(genericH160FixedBinary.asBytes()); // First 20 bytes

const ss58Format42ForGenericH160 = AccountId(42).dec(genericPaddedBytes);
const ss58Format0ForGenericH160 = AccountId(0).dec(genericPaddedBytes);

describe("toH160Bytes", () => {
  it("should return the same FixedSizeBinary instance if input is FixedSizeBinary", () => {
    const input = genericH160FixedBinary;
    const result = toH160Bytes(input);
    expect(result).toBe(input); // Check for instance equality
    expect(result.asHex()).toBe(genericH160Hex);
  });

  it("should convert a hex string to FixedSizeBinary", () => {
    const input = genericH160Hex;
    const result = toH160Bytes(input);

    expect(result).toBeInstanceOf(FixedSizeBinary);
    expect(result.asHex()).toBe(genericH160Hex);
    expect(result.asBytes().length).toBe(20);
  });

  it("should convert an SS58 address string to H160 FixedSizeBinary", () => {
    const input = ss58Alice;
    const result = toH160Bytes(input);

    expect(result).toBeInstanceOf(FixedSizeBinary);
    expect(result.asHex()).toBe(h160HexForAliceSs58Derived);
    expect(result.asBytes().length).toBe(20);
  });
});

describe("toSs58Address", () => {
  it("should convert hex string to SS58 address with default format", () =>
    expect(toSs58Address(genericH160Hex)).toBe(ss58Format42ForGenericH160));

  it("should convert hex string to SS58 address with specified format (2)", () => {
    const accountId = AccountId(2);

    expect(toSs58Address(genericH160Hex, 2)).toBe(
      accountId.dec(accountId.enc(ss58Format0ForGenericH160)),
    );
  });

  it("should return the same SS58 address if input is SS58String (default format)", () =>
    expect(toSs58Address(ss58Alice)).toBe(ss58Alice));

  it("should return the same SS58 address if input is SS58String with specified format (2)", () => {
    const accountId = AccountId(2);

    expect(toSs58Address(ss58Alice, 2)).toBe(
      accountId.dec(accountId.enc(ss58Alice)),
    );
  });
});
