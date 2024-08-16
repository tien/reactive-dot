import {
  getDynamicBuilder,
  getLookupFn,
} from "@polkadot-api/metadata-builders";
import {
  Struct,
  Bytes,
  enhanceCodec,
  metadata as metadataCodec,
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
import { map } from "rxjs/operators";

export type GetBlockOptions = {
  tag?: "best" | "finalized";
};

export function getBlock<TOptions extends GetBlockOptions>(
  client: PolkadotClient,
  options?: TOptions,
) {
  switch (options?.tag) {
    case "best":
      return client.bestBlocks$.pipe(map((blockInfos) => blockInfos.at(0)!));
    case "finalized":
    default:
      return client.finalizedBlock$;
  }
}

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
  ) as Codec<
    Enum<{
      Id: SS58String;
      Index: number | bigint;
      Raw: Binary;
      Address32: FixedSizeBinary<32>;
      Address20: FixedSizeBinary<20>;
    }>
  >;

  const signature$ = dynamicBuilder.buildDefinition(
    metadata.extrinsic.signature,
  ) as Codec<
    Enum<{
      Ed25519: FixedSizeBinary<64>;
      Sr25519: FixedSizeBinary<64>;
      Ecdsa: FixedSizeBinary<65>;
    }>
  >;

  const call$ = dynamicBuilder.buildDefinition(
    metadata.extrinsic.call,
  ) as Codec<{ module: string; method: string; args: unknown }>;

  const inherentExtrinsic$ = Struct({
    version: version$ as Codec<{ version: number; signed: false }>,
    body: Struct({ call: call$ }),
  });

  const signedExtrinsic$ = Struct({
    version: version$ as Codec<{ version: number; signed: true }>,
    body: Struct({
      signer: address$,
      signature: signature$,
      extra: dynamicBuilder.buildDefinition(metadata.extrinsic.extra),
      call: call$,
    }),
  });

  const blockBody = await client.getBlockBody(blockHash);

  const simpleVersion$ = Struct({
    version: version$,
  });

  const bytes$ = Bytes();

  return blockBody.map((extrinsicHex: string) => {
    const bytes = bytes$.dec(extrinsicHex);

    const {
      version: { version, signed },
    } = simpleVersion$.dec(bytes);

    if (version !== 4) {
      return;
    }

    return (signed ? signedExtrinsic$.dec : inherentExtrinsic$.dec)(bytes);
  });
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
