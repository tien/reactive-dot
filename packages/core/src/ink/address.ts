import type { ContractAddress } from "./types.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { AccountId, FixedSizeBinary } from "polkadot-api";

export function toH160Bytes(address: ContractAddress): FixedSizeBinary<20> {
  if (address instanceof FixedSizeBinary) {
    return address;
  }

  if (address.startsWith("0x")) {
    return FixedSizeBinary.fromHex(address);
  }

  return FixedSizeBinary.fromBytes(
    keccak_256(FixedSizeBinary.fromAccountId32<32>(address).asBytes()).slice(
      12,
    ),
  );
}

export function toSs58Address(
  address: ContractAddress,
  ss58Format?: number,
  padInt = 0,
) {
  const accountId = AccountId(ss58Format);

  if (address instanceof FixedSizeBinary) {
    return accountId.dec(address.asBytes());
  }

  if (address.startsWith("0x")) {
    return accountId.dec(
      new Uint8Array([
        ...FixedSizeBinary.fromHex(address).asBytes().slice(0, 20),
        ...Array.from<number>({ length: 12 }).fill(padInt),
      ]),
    );
  }

  return accountId.dec(accountId.enc(address));
}
