import { QueryError } from "../errors.js";
import type {
  InferQueryInstructionPayload,
  SimpleInkQueryInstruction,
} from "./query-builder.js";
import { unwrapResult } from "./result.js";
import type { GenericInkDescriptors, InkCompatApi } from "./types.js";
import type { InkClient } from "@polkadot-api/ink-contracts";

export async function queryInk<
  Descriptor extends GenericInkDescriptors,
  Instruction extends SimpleInkQueryInstruction,
>(
  api: InkCompatApi,
  client: InkClient<GenericInkDescriptors>,
  address: string,
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

      const response = await api.apis.ContractsApi.get_storage(
        address,
        storage.encode(instruction.key),
        apiOptions,
      );

      if (!response.success) {
        throw QueryError.from(response.value);
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

      const response = await api.apis.ContractsApi.call(
        address,
        address,
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
