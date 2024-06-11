import type {
  InferInstructionResponse,
  QueryInstruction,
} from "./QueryBuilder.js";
import type { ReDotDescriptor } from "@reactive-dot/types";
import type { ChainDefinition, TypedApi } from "polkadot-api";

const query = <
  TInstruction extends QueryInstruction,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
>(
  api: TypedApi<TDescriptor>,
  instruction: TInstruction,
  options?: { signal?: AbortSignal },
): InferInstructionResponse<TInstruction> => {
  switch (instruction.instruction) {
    case "fetch-constant":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (api as any).constants[instruction.pallet][
        instruction.constant
      ]() as InferInstructionResponse<TInstruction>;
    case "call-api":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (api as any).apis[instruction.pallet][instruction.api](
        ...instruction.args,
        { signal: options?.signal },
      ) as InferInstructionResponse<TInstruction>;
    case "read-storage":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (api as any).query[instruction.pallet][
        instruction.storage
      ].watchValue(
        ...instruction.args,
      ) as InferInstructionResponse<TInstruction>;
    case "read-storage-entries":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (api as any).query[instruction.pallet][
        instruction.storage
      ].getEntries(...instruction.args, {
        signal: options?.signal,
      }) as InferInstructionResponse<TInstruction>;
  }
};

export default query;
