/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseInstruction } from "../query-builder.js";
import type {
  ExcludeProperties,
  Finality,
  FlatHead,
  StringKeyOf,
} from "../types.js";
import type { UnwrapResult } from "./result.js";
import type { GenericInkDescriptors } from "./types.js";

type StorageReadInstruction<
  TPath extends string = string,
  TKey = any,
> = BaseInstruction<"read-storage"> & {
  path: TPath;
  key: TKey | undefined;
  at: Finality | undefined;
};

type MultiStorageReadInstruction<
  TPath extends string = string,
  TKey = any,
> = Omit<StorageReadInstruction<TPath, TKey>, "key"> & {
  multi: true;
  keys: TKey[];
};

export type InferStorageReadInstructionPayload<
  TInstruction extends StorageReadInstruction | MultiStorageReadInstruction,
  TDescriptor extends GenericInkDescriptors,
> = TDescriptor["__types"]["storage"][TInstruction["path"]]["value"];

type MessageSendInstruction<
  TName extends string = string,
  TBody = any,
> = BaseInstruction<"send-message"> & {
  name: TName;
  body: TBody | undefined;
  at: Finality | undefined;
};

type MultiMessageSendInstruction<
  TName extends string = string,
  TBody = any,
> = Omit<MessageSendInstruction<TName, TBody>, "body"> & {
  multi: true;
  bodies: TBody[];
};

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
  ? Array<InferStorageReadInstructionPayload<TInstruction, TDescriptor>>
  : TInstruction extends StorageReadInstruction
    ? InferStorageReadInstructionPayload<TInstruction, TDescriptor>
    : TInstruction extends MultiMessageSendInstruction
      ? Array<InferMessageSendInstructionPayload<TInstruction, TDescriptor>>
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
    });
  }

  /** @experimental */
  storage<
    TPath extends Exclude<StringKeyOf<TDescriptor["__types"]["storage"]>, "">,
  >(
    path: TPath,
    ...keyAndOptions: TDescriptor["__types"]["storage"][TPath]["key"] extends undefined
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
      key: keyAndOptions[0] as any,
      at: keyAndOptions[1]?.at,
    });
  }

  /** @experimental */
  storages<
    TPath extends Exclude<StringKeyOf<TDescriptor["__types"]["storage"]>, "">,
  >(
    path: TPath,
    keys: Array<TDescriptor["__types"]["storage"][TPath]["key"]>,
    options?: { at?: Finality },
  ) {
    return this.#append({
      instruction: "read-storage",
      multi: true,
      path,
      keys,
      at: options?.at,
    });
  }

  /** @experimental */
  message<
    TName extends StringKeyOf<
      ExcludeProperties<TDescriptor["__types"]["messages"], { mutates: true }>
    >,
  >(
    name: TName,
    ...bodyAndOptions: Extract<
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      undefined | {},
      TDescriptor["__types"]["messages"][TName]["message"]
    > extends never
      ? [
          body: TDescriptor["__types"]["messages"][TName]["message"],
          options?: { at?: Finality },
        ]
      : [
          body?: TDescriptor["__types"]["messages"][TName]["message"],
          options?: { at?: Finality },
        ]
  ) {
    return this.#append({
      instruction: "send-message",
      name,
      body: bodyAndOptions[0] as any,
      at: bodyAndOptions[1]?.at,
    });
  }

  /** @experimental */
  messages<
    TName extends StringKeyOf<
      ExcludeProperties<TDescriptor["__types"]["messages"], { mutates: true }>
    >,
  >(
    name: TName,
    bodies: Array<TDescriptor["__types"]["messages"][TName]["message"]>,
    options?: { at?: Finality },
  ) {
    return this.#append({
      instruction: "send-message",
      multi: true,
      name,
      bodies,
      at: options?.at,
    });
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
