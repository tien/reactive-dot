/* v8 ignore start */
import {
  getDynamicBuilder,
  getLookupFn,
} from "@polkadot-api/metadata-builders";
import {
  Bytes,
  enhanceCodec,
  metadata as metadataCodec,
  Struct,
  u8,
  type V15,
} from "@polkadot-api/substrate-bindings";
import type {
  Binary,
  ChainDefinition,
  Codec,
  Enum,
  FixedSizeBinary,
  PolkadotClient,
  SS58String,
  TypedApi,
} from "polkadot-api";

type MultiAddress = Enum<{
  Id: SS58String;
  Index: number | bigint;
  Raw: Binary;
  Address32: FixedSizeBinary<32>;
  Address20: FixedSizeBinary<20>;
}>;

type MultiSignature = Enum<{
  Ed25519: FixedSizeBinary<64>;
  Sr25519: FixedSizeBinary<64>;
  Ecdsa: FixedSizeBinary<65>;
}>;

type Extra = Partial<{
  nonZeroSender: undefined;
  specVersion: undefined;
  txVersion: undefined;
  genesis: undefined;
  mortality: { type: `Mortal${string}`; value: number };
  nonce: number;
  weight: undefined;
  transactionPayment: bigint;
  metadataHash: Enum<{ Disabled: undefined; Enabled: undefined }>;
  [key: string]: unknown;
}>;

type Call = {
  module: string;
  func: string;
  args: unknown;
};

type Extrinsic = { version: number; call: Call } & (
  | { signed: false }
  | {
      signed: true;
      sender: MultiAddress;
      signature: MultiSignature;
      extra: Extra;
    }
);

export async function unstable_getBlockExtrinsics(
  client: PolkadotClient,
  typedApi: TypedApi<ChainDefinition>,
  blockHash: string,
) {
  const v15MetadataBinary = await (
    typedApi.apis["Metadata"]!["metadata_at_version"]! as (
      version: number,
    ) => Promise<Binary | undefined>
  )(15);

  if (v15MetadataBinary === undefined) {
    return;
  }

  const metadataResult = metadataCodec.dec(v15MetadataBinary.asBytes());

  if (metadataResult.metadata.tag !== "v15") {
    return;
  }

  const metadata = metadataResult.metadata.value;

  const dynamicBuilder = await getOrCreateDynamicBuilder(client, metadata);

  const version$ = enhanceCodec(
    u8,
    (value: { signed: boolean; version: number }) =>
      (+!!value.signed << 7) | value.version,
    (value) => ({
      version: value & ~(1 << 7),
      signed: !!(value & (1 << 7)),
    }),
  );

  const address$ = dynamicBuilder.buildDefinition(
    metadata.extrinsic.address,
  ) as Codec<MultiAddress>;

  const signature$ = dynamicBuilder.buildDefinition(
    metadata.extrinsic.signature,
  ) as Codec<MultiSignature>;

  const rawExtra$ = dynamicBuilder.buildDefinition(
    metadata.extrinsic.extra,
  ) as Codec<unknown[]>;

  const extra$ = enhanceCodec(
    rawExtra$,
    (extra: Extra) =>
      metadata.extrinsic.signedExtensions.map(
        (signedExtension) =>
          extra[
            "Check" +
              signedExtension.identifier.slice(0, 1).toUpperCase() +
              signedExtension.identifier.slice(1, 0)
          ],
      ),
    (extra) =>
      Object.fromEntries(
        metadata.extrinsic.signedExtensions.map((signedExtension, index) => {
          const name = signedExtension.identifier.replace(/^Check/, "");
          return [
            name.slice(0, 1).toLowerCase() + name.slice(1),
            extra[index],
          ] as const;
        }),
      ) as Extra,
  );

  const rawCall$ = dynamicBuilder.buildDefinition(
    metadata.extrinsic.call,
  ) as Codec<{ type: string; value: { type: string; value: unknown } }>;

  const call$ = enhanceCodec(
    rawCall$,
    (call: Call) => ({
      type: call.module,
      value: { type: call.func, value: call.args },
    }),
    (call) => ({
      module: call.type,
      func: call.value.type,
      args: call.value.value,
    }),
  );

  const inherentExtrinsic$ = Struct({
    version: version$ as Codec<{ version: number; signed: false }>,
    body: Struct({ call: call$ }),
  });

  const signedExtrinsic$ = Struct({
    version: version$ as Codec<{ version: number; signed: true }>,
    body: Struct({
      sender: address$,
      signature: signature$,
      extra: extra$,
      call: call$,
    }),
  });

  const simpleVersion$ = Struct({
    version: version$,
  });

  const extrinsic$ = enhanceCodec(
    Bytes(),
    (extrinsic: Extrinsic) =>
      extrinsic.signed
        ? signedExtrinsic$.enc({
            version: { version: extrinsic.version, signed: extrinsic.signed },
            body: {
              sender: extrinsic.sender,
              signature: extrinsic.signature,
              extra: extrinsic.extra,
              call: extrinsic.call,
            },
          })
        : inherentExtrinsic$.enc({
            version: { version: extrinsic.version, signed: extrinsic.signed },
            body: { call: extrinsic.call },
          }),
    (extrinsicBytes) => {
      const {
        version: { signed },
      } = simpleVersion$.dec(extrinsicBytes);

      const rawExtrinsic = (
        signed ? signedExtrinsic$.dec : inherentExtrinsic$.dec
      )(extrinsicBytes);

      return { ...rawExtrinsic.version, ...rawExtrinsic.body } as Extrinsic;
    },
  );

  const blockBody = await client.getBlockBody(blockHash);

  return blockBody.map(extrinsic$.dec);
}

const dynamicBuilders = new WeakMap<
  PolkadotClient,
  ReturnType<typeof getDynamicBuilder>
>();

async function getOrCreateDynamicBuilder(
  client: PolkadotClient,
  metadata: V15,
) {
  if (dynamicBuilders.has(client)) {
    return dynamicBuilders.get(client)!;
  }

  const lookup = getLookupFn(metadata);
  const dynamicBuilder = getDynamicBuilder(lookup);

  return dynamicBuilders.set(client, dynamicBuilder).get(client)!;
}
