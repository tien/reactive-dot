import type {
  InferInstructionResponse,
  QueryInstruction,
} from "./QueryBuilder.js";
import { ReDotDescriptor } from "./types/index.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";

export const preflight = <TInstruction extends QueryInstruction>(
  instruction: TInstruction,
) => {
  type Return = TInstruction["instruction"] extends "fetch-constant"
    ? "promise"
    : TInstruction["instruction"] extends "call-api"
      ? "promise"
      : TInstruction["instruction"] extends "read-storage-entries"
        ? "promise"
        : TInstruction["instruction"] extends "read-storage"
          ? "observable"
          : "promise" | "observable";

  switch (instruction.instruction) {
    case "fetch-constant":
    case "call-api":
    case "read-storage-entries":
      return "promise" as Return;
    case "read-storage":
      return "observable" as Return;
  }
};

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
