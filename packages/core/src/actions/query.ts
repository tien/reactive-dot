import type { CommonDescriptor } from "../chains.js";
import type {
  InferInstructionResponse,
  QueryInstruction,
} from "../query-builder.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import { map } from "rxjs/operators";

export function query<
  TInstruction extends QueryInstruction,
  TDescriptor extends ChainDefinition = CommonDescriptor,
>(
  api: TypedApi<TDescriptor>,
  instruction: TInstruction,
  options?: { signal?: AbortSignal },
): InferInstructionResponse<TInstruction> {
  switch (instruction.instruction) {
    case "get-constant":
      return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (api.constants[instruction.pallet]![instruction.constant] as any)()
      );
    case "call-api":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (api.apis[instruction.pallet]![instruction.api] as any)(
        ...instruction.args,
        { signal: options?.signal, at: instruction.at },
      );
    case "read-storage": {
      const storageEntry = api.query[instruction.pallet]![
        instruction.storage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any;

      return instruction.at?.startsWith("0x")
        ? storageEntry.getValue(...instruction.args, { at: instruction.at })
        : storageEntry.watchValue(
            ...instruction.args,
            ...[instruction.at].filter((x) => x !== undefined),
          );
    }
    case "read-storage-entries":
      return instruction.at?.startsWith("0x")
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (api.query[instruction.pallet]![instruction.storage] as any) // Comment to prevent formatting
            .getEntries(...instruction.args, {
              signal: options?.signal,
              at: instruction.at,
            })
            .then((response: Array<{ keyArgs: unknown; value: unknown }>) =>
              response.map(({ keyArgs, value }) =>
                Object.assign([keyArgs, value], {
                  /** @deprecated Use index access instead. */
                  keyArgs,
                  /** @deprecated Use index access instead. */
                  value,
                }),
              ),
            )
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (api.query[instruction.pallet]![instruction.storage] as any) // Comment to prevent formatting
            .watchEntries(...instruction.args, {
              at: instruction.at,
            })
            .pipe(
              map(
                (response: {
                  entries: Array<{ args: unknown; value: unknown }>;
                }) =>
                  response.entries.map(({ args, value }) =>
                    Object.assign([args, value], {
                      /** @deprecated Use index access instead. */
                      keyArgs: args,
                      /** @deprecated Use index access instead. */
                      value,
                    }),
                  ),
              ),
            );
  }
}

export function preflight(instruction: QueryInstruction) {
  if ("at" in instruction && instruction.at?.startsWith("0x")) {
    return "promise";
  }

  switch (instruction.instruction) {
    case "get-constant":
    case "call-api":
      return "promise";
    case "read-storage-entries":
    case "read-storage":
      return "observable";
  }
}
