import { QueryError } from "../errors.js";
import { toH160Bytes, toSs58Address } from "./address.js";
import type {
  InferQueryInstructionPayload,
  SimpleInkQueryInstruction,
} from "./query-builder.js";
import { unwrapResult } from "./result.js";
import type {
  ContractAddress,
  GenericInkDescriptors,
  InkCompatApi,
} from "./types.js";
import type { InkClient } from "@polkadot-api/ink-contracts";

export async function queryInk<
  Descriptor extends GenericInkDescriptors,
  Instruction extends SimpleInkQueryInstruction,
>(
  api: InkCompatApi,
  client: InkClient<GenericInkDescriptors>,
  address: ContractAddress,
  instruction: Instruction,
  options?: { signal?: AbortSignal },
) {
  const apiOptions = {
    ...(instruction?.at === undefined ? undefined : { at: instruction.at }),
    ...(options?.signal === undefined ? undefined : { signal: options.signal }),
  };

  switch (instruction.instruction) {
    case "read-storage": {
      const storage =
        instruction.path === ""
          ? client.storage()
          : client.storage(instruction.path);

      const key = storage.encode(instruction.key);

      const response = await api.apis.ReviveApi.get_storage_var_key(
        toH160Bytes(address),
        key,
        apiOptions,
      );

      if (!response.success) {
        throw QueryError.from(response.value, response.value.type);
      }

      return response.value === undefined
        ? undefined
        : (storage.decode(response.value) as InferQueryInstructionPayload<
            Instruction,
            Descriptor
          >);
    }
    case "send-message": {
      const message = client.message(instruction.name);

      if (message.attributes.mutates) {
        throw new QueryError(
          `Mutating message ${instruction.name} cannot be used in a readonly query`,
        );
      }

      const response = await api.apis.ReviveApi.call(
        toSs58Address(instruction.origin ?? address, undefined, 238),
        toH160Bytes(address),
        0n,
        undefined,
        undefined,
        message.encode(instruction.body),
        apiOptions,
      );

      if (!response.result.success) {
        throw QueryError.from(response.result.value);
      }

      return unwrapResult(
        message.decode(response.result.value),
      ) as InferQueryInstructionPayload<Instruction, Descriptor>;
    }
  }
}
