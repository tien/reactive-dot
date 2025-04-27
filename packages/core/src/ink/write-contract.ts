import type { StringKeyOf } from "../types.js";
import type { GenericInkDescriptors, InkCompatApi } from "./types.js";
import type { InkClient } from "@polkadot-api/ink-contracts";
import { Enum } from "polkadot-api";

export async function writeContract<
  TDescriptor extends GenericInkDescriptors,
  TMessageName extends StringKeyOf<
    GenericInkDescriptors["__types"]["messages"]
  >,
>(
  api: InkCompatApi,
  client: InkClient<GenericInkDescriptors>,
  address: string,
  message: TMessageName,
  args: {
    origin: string;
    value?: bigint;
    data: TDescriptor["__types"]["messages"][TMessageName]["message"];
  },
) {
  const data = client.message(message).encode(args.data ?? {});

  const gasLimit = await (async () => {
    const response = await api.apis.ContractsApi.call(
      args.origin,
      address,
      args.value ?? 0n,
      undefined,
      undefined,
      data,
    );

    return response.gas_required;
  })();

  return api.tx.Contracts.call({
    dest: Enum("Id", address),
    value: args.value ?? 0n,
    gas_limit: gasLimit,
    storage_deposit_limit: undefined,
    data,
  });
}
