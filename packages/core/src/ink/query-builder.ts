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
  TInstructions extends readonly InkQueryInstruction[],
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
  const TInstructions extends
    readonly InkQueryInstruction[] = readonly InkQueryInstruction[],
> {
  readonly #instructions: TInstructions;

  constructor(
    instructions: TInstructions = [] as readonly InkQueryInstruction[] as TInstructions,
  ) {
    this.#instructions = instructions;
  }

  get instructions() {
    return Object.freeze(this.#instructions.slice()) as TInstructions;
  }

  rootStorage(options?: { at?: Finality }) {
    return this.#append({
      instruction: "read-storage",
      path: "" as const,
      key: undefined,
      at: options?.at,
    });
  }

  storage<
    TPath extends Exclude<StringKeyOf<TDescriptor["__types"]["storage"]>, "">,
    TKey extends TDescriptor["__types"]["storage"][TPath]["key"],
  >(
    path: TPath,
    ...keyAndOptions: TKey extends undefined
      ? [key?: TKey, options?: { at?: Finality }]
      : [key: TKey, options?: { at?: Finality }]
  ) {
    return this.#append({
      instruction: "read-storage",
      path,
      key: keyAndOptions[0] as any,
      at: keyAndOptions[1]?.at,
    });
  }

  storages<
    TPath extends Exclude<StringKeyOf<TDescriptor["__types"]["storage"]>, "">,
    TKey extends TDescriptor["__types"]["storage"][TPath]["key"],
  >(path: TPath, keys: TKey[], options?: { at?: Finality }) {
    return this.#append({
      instruction: "read-storage",
      multi: true,
      path,
      keys,
      at: options?.at,
    });
  }

  message<
    TName extends StringKeyOf<
      ExcludeProperties<TDescriptor["__types"]["messages"], { mutates: true }>
    >,
    TBody extends TDescriptor["__types"]["messages"][TName]["message"],
  >(
    name: TName,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    ...bodyAndOptions: Extract<undefined | {}, TBody> extends never
      ? [body: TBody, options?: { at?: Finality }]
      : [body?: TBody, options?: { at?: Finality }]
  ) {
    return this.#append({
      instruction: "send-message",
      name,
      body: bodyAndOptions[0] as any,
      at: bodyAndOptions[1]?.at,
    });
  }

  messages<
    TName extends StringKeyOf<
      ExcludeProperties<TDescriptor["__types"]["messages"], { mutates: true }>
    >,
    TBody extends TDescriptor["__types"]["messages"][TName]["message"],
  >(name: TName, bodies: TBody[], options?: { at?: Finality }) {
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
