import type { HexString } from "@polkadot-api/substrate-bindings";
import {
  Bytes,
  Option,
  Struct,
  compact,
  compactBn,
  u32,
} from "@polkadot-api/substrate-bindings";
import { toHex } from "@polkadot-api/utils";

type SignedExtension = {
  value: Uint8Array;
  additionalSigned: Uint8Array;
};

function toPjsHex(value: number | bigint, minByteLen?: number) {
  let inner = value.toString(16);
  inner = (inner.length % 2 ? "0" : "") + inner;
  const nPaddedBytes = Math.max(0, (minByteLen || 0) - inner.length / 2);
  return "0x" + "00".repeat(nPaddedBytes) + inner;
}

export function CheckGenesis({ additionalSigned }: SignedExtension): {
  genesisHash: string;
} {
  return {
    genesisHash: toHex(additionalSigned),
  };
}

export function CheckNonce({ value }: SignedExtension): { nonce: HexString } {
  // nonce is a u32 in pjs => 4 bytes
  return { nonce: toPjsHex(compact.dec(value), 4) };
}

export function CheckTxVersion({ additionalSigned }: SignedExtension): {
  transactionVersion: HexString;
} {
  return { transactionVersion: toPjsHex(u32.dec(additionalSigned), 4) };
}

const assetTxPaymentDec = Struct({
  tip: compact,
  asset: Option(Bytes(Infinity)),
}).dec;

export function ChargeAssetTxPayment({ value }: SignedExtension): {
  aseetId?: string;
  tip?: string;
} {
  const { tip, asset } = assetTxPaymentDec(value);

  return {
    ...(asset ? { assetId: toHex(asset) } : {}),
    tip: toPjsHex(tip, 16),
  };
}

export function ChargeTransactionPayment({ value }: SignedExtension): {
  tip: HexString;
} {
  return {
    tip: toPjsHex(compactBn.dec(value), 16),
  };
}

export function CheckMortality(
  { value, additionalSigned }: SignedExtension,
  blockNumber: number,
): { era: HexString; blockHash: HexString; blockNumber: HexString } {
  return {
    era: toHex(value),
    blockHash: toHex(additionalSigned),
    blockNumber: toPjsHex(blockNumber, 4),
  };
}

export function CheckSpecVersion({ additionalSigned }: SignedExtension): {
  specVersion: HexString;
} {
  return {
    specVersion: toPjsHex(u32.dec(additionalSigned), 4),
  };
}

// we create the tx without metadata hash, it's optional for PJS
export function CheckMetadataHash() {
  return {};
}
