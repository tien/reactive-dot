/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseInstruction, MultiInstruction } from "../query-builder.js";
import type { pending } from "../symbols.js";
import type {
  ExcludeProperties,
  Finality,
  FlatHead,
  StringKeyOf,
} from "../types.js";
import type { UnwrapResult } from "./result.js";
import type { ContractAddress, GenericInkDescriptors } from "./types.js";

type StorageReadInstruction = BaseInstruction<"read-storage"> & {
  path: string;
  key: unknown | undefined;
  at: Finality | undefined;
};

type MultiStorageReadInstruction = MultiInstruction<
  StorageReadInstruction,
  "key",
  "keys"
>;

export type InferStorageReadInstructionPayload<
  TInstruction extends StorageReadInstruction | MultiStorageReadInstruction,
  TDescriptor extends GenericInkDescriptors,
> = TDescriptor["__types"]["storage"][TInstruction["path"]]["value"];

type MessageSendInstruction = BaseInstruction<"send-message"> & {
  name: string;
  body:
    | {
        [Sym: symbol]: never;
        [Num: number]: never;
        [Str: string]: unknown;
      }
    | undefined;
  origin: ContractAddress | undefined;
  at: Finality | undefined;
};

type MultiMessageSendInstruction = MultiInstruction<
  MessageSendInstruction,
  "body",
  "bodies"
>;

export type InferMessageSendInstructionPayload<
  TInstruction extends MessageSendInstruction | MultiMessageSendInstruction,
  TDescriptor extends GenericInkDescriptors,
> = UnwrapResult<
  TDescriptor["__types"]["messages"][TInstruction["name"]]["response"]
>;

export type SimpleInkQueryInstruction =
  | StorageReadInstruction
  | MessageSendInstruction;

export type InkQueryInstruction =
  | SimpleInkQueryInstruction
  | MultiStorageReadInstruction
  | MultiMessageSendInstruction;

export type InferQueryInstructionPayload<
  TInstruction extends InkQueryInstruction,
  TDescriptor extends GenericInkDescriptors,
> = TInstruction extends MultiStorageReadInstruction
  ? Array<
      true extends TInstruction["directives"]["stream"]
        ?
            | InferStorageReadInstructionPayload<TInstruction, TDescriptor>
            | typeof pending
        : InferStorageReadInstructionPayload<TInstruction, TDescriptor>
    >
  : TInstruction extends StorageReadInstruction
    ? InferStorageReadInstructionPayload<TInstruction, TDescriptor>
    : TInstruction extends MultiMessageSendInstruction
      ? Array<
          true extends TInstruction["directives"]["stream"]
            ?
                | InferMessageSendInstructionPayload<TInstruction, TDescriptor>
                | typeof pending
            : InferMessageSendInstructionPayload<TInstruction, TDescriptor>
        >
      : TInstruction extends MessageSendInstruction
        ? InferMessageSendInstructionPayload<TInstruction, TDescriptor>
        : never;

export type InferInkInstructionsPayload<
  TInstructions extends InkQueryInstruction[],
  TDescriptor extends GenericInkDescriptors,
> = FlatHead<
  Extract<
    {
      [Index in keyof TInstructions]: InferQueryInstructionPayload<
        TInstructions[Index],
        TDescriptor
      >;
    },
    unknown[]
  >
>;

export type InferInkQueryPayload<T extends InkQuery> =
  T extends InkQuery<infer Descriptor, infer Instructions>
    ? InferInkInstructionsPayload<Instructions, Descriptor>
    : never;

export class InkQuery<
  TDescriptor extends GenericInkDescriptors = GenericInkDescriptors,
  const TInstructions extends InkQueryInstruction[] = InkQueryInstruction[],
> {
  readonly #instructions: TInstructions;

  constructor(
    instructions: TInstructions = [] as InkQueryInstruction[] as TInstructions,
  ) {
    this.#instructions = instructions;
  }

  get instructions() {
    return Object.freeze(this.#instructions.slice()) as TInstructions;
  }

  /** @experimental */
  rootStorage(options?: { at?: Finality }) {
    return this.#append({
      instruction: "read-storage",
      path: "" as const,
      key: undefined,
      at: options?.at,
    } satisfies StorageReadInstruction);
  }

  /** @experimental */
  storage<
    const TPath extends Exclude<
      StringKeyOf<TDescriptor["__types"]["storage"]>,
      ""
    >,
  >(
    path: TPath,
    ...[
      key,
      options,
    ]: TDescriptor["__types"]["storage"][TPath]["key"] extends undefined
      ? [
          key?: TDescriptor["__types"]["storage"][TPath]["key"],
          options?: { at?: Finality },
        ]
      : [
          key: TDescriptor["__types"]["storage"][TPath]["key"],
          options?: { at?: Finality },
        ]
  ) {
    return this.#append({
      instruction: "read-storage",
      path,
      key: key as any,
      at: options?.at,
    } satisfies StorageReadInstruction);
  }

  /** @experimental */
  storages<
    const TPath extends Exclude<
      StringKeyOf<TDescriptor["__types"]["storage"]>,
      ""
    >,
    const TStream extends boolean = false,
  >(
    path: TPath,
    keys: Array<TDescriptor["__types"]["storage"][TPath]["key"]>,
    options?: { at?: Finality; stream?: TStream },
  ) {
    return this.#append({
      instruction: "read-storage",
      multi: true,
      directives: {
        stream: options?.stream as NoInfer<TStream>,
      },
      path,
      keys,
      at: options?.at,
    } satisfies MultiStorageReadInstruction);
  }

  /** @experimental */
  message<
    const TName extends StringKeyOf<
      ExcludeProperties<TDescriptor["__types"]["messages"], { mutates: true }>
    >,
  >(
    name: TName,
    ...[body, options]: Extract<
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      undefined | {},
      TDescriptor["__types"]["messages"][TName]["message"]
    > extends never
      ? [
          body: TDescriptor["__types"]["messages"][TName]["message"],
          options?: { origin?: ContractAddress; at?: Finality },
        ]
      : [
          body?: TDescriptor["__types"]["messages"][TName]["message"],
          options?: { origin?: ContractAddress; at?: Finality },
        ]
  ) {
    return this.#append({
      instruction: "send-message",
      // TODO: this is needed for some reason
      name: name as typeof name,
      body,
      origin: options?.origin,
      at: options?.at,
    } satisfies MessageSendInstruction);
  }

  /** @experimental */
  messages<
    const TName extends StringKeyOf<
      ExcludeProperties<TDescriptor["__types"]["messages"], { mutates: true }>
    >,
    const TStream extends boolean = false,
  >(
    name: TName,
    bodies: Array<TDescriptor["__types"]["messages"][TName]["message"]>,
    options?: { origin?: ContractAddress; at?: Finality; stream?: TStream },
  ) {
    return this.#append({
      instruction: "send-message",
      multi: true,
      directives: {
        stream: options?.stream as NoInfer<TStream>,
      },
      // TODO: this is needed for some reason
      name: name as typeof name,
      bodies,
      origin: options?.origin,
      at: options?.at,
    } satisfies MultiMessageSendInstruction);
  }

  #append<const TInstruction extends InkQueryInstruction>(
    instruction: TInstruction,
  ) {
    return new InkQuery([...this.#instructions, instruction]) as InkQuery<
      TDescriptor,
      [...TInstructions, TInstruction]
    >;
  }
}
