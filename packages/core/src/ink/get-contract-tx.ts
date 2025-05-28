import type { ExtractExactProperties, StringKeyOf } from "../types.js";
import { toH160Bytes } from "./address.js";
import type {
  GenericInkDescriptors,
  InkCompatApi,
  InkTxBody,
} from "./types.js";
import type { InkClient } from "@polkadot-api/ink-contracts";
import { AccountId, type PolkadotSigner } from "polkadot-api";

export async function getInkContractTx<
  TDescriptor extends GenericInkDescriptors,
  TMessageName extends StringKeyOf<
    ExtractExactProperties<
      TDescriptor["__types"]["messages"],
      { mutates: true }
    >
  >,
>(
  api: InkCompatApi,
  inkClient: InkClient<GenericInkDescriptors>,
  signer: PolkadotSigner,
  contract: string,
  messageName: TMessageName,
  body: InkTxBody<TDescriptor, TMessageName>,
  options?: { signal?: AbortSignal },
) {
  const message = inkClient.message(messageName);

  if (!message.attributes.mutates) {
    throw new Error(
      `Readonly message ${String(messageName)} cannot be used in a mutating transaction`,
    );
  }

  const origin = toSs58(signer.publicKey);

  const dest = toH160Bytes(contract);

  const data = message.encode(
    "data" in body
      ? // TODO: fix this
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (body.data as any)
      : {},
  );

  const value =
    "value" in body
      ? // TODO: fix this
        (body.value as bigint)
      : 0n;

  const dryRunResult = await api.apis.ReviveApi.call(
    origin,
    dest,
    value,
    undefined,
    undefined,
    data,
    !options?.signal ? {} : { signal: options?.signal },
  );

  return api.tx.Revive.call({
    dest,
    value,
    gas_limit: dryRunResult.gas_required,
    storage_deposit_limit: dryRunResult.storage_deposit.value,
    data,
  });
}

const toSs58 = AccountId().dec;
