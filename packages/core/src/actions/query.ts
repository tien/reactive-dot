import type {
  InferInstructionResponse,
  QueryInstruction,
} from "../QueryBuilder.js";
import type { CommonDescriptor } from "../config.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";

export function preflight<TInstruction extends QueryInstruction>(
  instruction: TInstruction,
) {
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
}

export function query<
  TInstruction extends QueryInstruction,
  TDescriptor extends ChainDefinition = CommonDescriptor,
>(
  api: TypedApi<TDescriptor>,
  instruction: TInstruction,
  options?: { signal?: AbortSignal },
): InferInstructionResponse<TInstruction> {
  switch (instruction.instruction) {
    case "fetch-constant":
      return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (api.constants[instruction.pallet]![instruction.constant] as any)()
      );
    case "call-api":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (api.apis[instruction.pallet]![instruction.api] as any)(
        ...instruction.args,
        { signal: options?.signal },
      );
    case "read-storage":
      return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (api.query[instruction.pallet]![instruction.storage] as any).watchValue(
          ...instruction.args,
        )
      );
    case "read-storage-entries":
      return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (api.query[instruction.pallet]![instruction.storage] as any).getEntries(
          ...instruction.args,
          {
            signal: options?.signal,
          },
        )
      );
  }
}
