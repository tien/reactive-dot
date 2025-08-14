import type { CommonDescriptor } from "./chains.js";
import type { Contract, DescriptorOfContract } from "./ink/contract.js";
import {
  type InferInkInstructionsPayload,
  InkQuery,
  type InkQueryInstruction,
} from "./ink/query-builder.js";
import type { GenericInkDescriptors } from "./ink/types.js";
import type { pending } from "./symbols.js";
import type { At, Finality, FlatHead, Flatten, StringKeyOf } from "./types.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import type { Observable } from "rxjs";

type PapiCallOptions = Partial<{
  at: string;
  signal: AbortSignal;
}>;

type OmitCallOptions<T extends unknown[]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? [Head] extends [PapiCallOptions]
    ? OmitCallOptions<Tail>
    : [Head, ...OmitCallOptions<Tail>]
  : [];

type InferPapiStorageEntry<T> = T extends {
  watchValue: (...args: [...infer Args, infer _]) => infer Response;
}
  ? { args: Args; response: Response }
  : { args: unknown[]; response: unknown };

type InferPapiStorageEntries<T> = T extends {
  getEntries: (
    ...args: infer Args
  ) => Promise<Array<{ keyArgs: infer Key; value: infer Value }>>;
}
  ? {
      args: OmitCallOptions<Args>;
      response: Promise<
        Array<
          [Key, Value] & {
            /** @deprecated Use index access instead. */
            keyArgs: Key;
            /** @deprecated Use index access instead. */
            value: Value;
          }
        >
      >;
    }
  : { args: unknown[]; response: unknown };

type InferPapiRuntimeCall<T> = T extends (...args: infer Args) => infer Response
  ? { args: OmitCallOptions<Args>; response: Response }
  : { args: unknown[]; response: unknown };

type InferPapiConstantEntry<T> = T extends {
  (): Promise<infer Payload>;
  (runtime: infer _): infer Payload;
}
  ? Promise<Payload>
  : unknown;

export type BaseInstruction<TName extends string> = {
  instruction: TName;
};

export type MultiInstruction<
  TInstruction extends BaseInstruction<string>,
  TMultiProperty extends string = "args",
  TMultiPropertyToName extends string = TMultiProperty,
> = Omit<TInstruction, TMultiProperty> & {
  multi: true;
  directives: {
    stream: boolean | undefined;
  };
} & {
  [P in TMultiProperty as TMultiPropertyToName]: TMultiProperty extends keyof TInstruction
    ? TInstruction[TMultiProperty][]
    : never;
};

export type ConstantFetchInstruction = BaseInstruction<"get-constant"> & {
  pallet: string;
  constant: string;
};

export type StorageReadInstruction = BaseInstruction<"read-storage"> & {
  pallet: string;
  storage: string;
  args: unknown[];
  at: At | undefined;
};

export type StorageEntriesReadInstruction =
  BaseInstruction<"read-storage-entries"> & {
    pallet: string;
    storage: string;
    args: unknown[];
    at: At | undefined;
  };

export type ApiCallInstruction = BaseInstruction<"call-api"> & {
  pallet: string;
  api: string;
  args: unknown[];
  at: Finality | undefined;
};

export type ContractReadInstruction = BaseInstruction<"read-contract"> & {
  contract: Contract;
  address: string;
  instructions: InkQuery["instructions"];
};

export type MultiContractReadInstruction = MultiInstruction<
  ContractReadInstruction,
  "address",
  "addresses"
>;

export type SimpleQueryInstruction =
  | ConstantFetchInstruction
  | StorageReadInstruction
  | StorageEntriesReadInstruction
  | ApiCallInstruction;

export type QueryInstruction =
  | SimpleQueryInstruction
  | MultiInstruction<StorageReadInstruction>
  | MultiInstruction<ApiCallInstruction>
  | ContractReadInstruction
  | MultiContractReadInstruction;

type ConstantFetchPayload<
  TInstruction extends ConstantFetchInstruction,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = InferPapiConstantEntry<
  TypedApi<TDescriptor>["constants"][TInstruction["pallet"]][TInstruction["constant"]]
>;

type StorageReadResponse<
  TInstruction extends
    | StorageReadInstruction
    | MultiInstruction<StorageReadInstruction>,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = InferPapiStorageEntry<
  TypedApi<TDescriptor>["query"][TInstruction["pallet"]][TInstruction["storage"]]
>["response"];

type StorageEntriesReadResponse<
  TInstruction extends StorageEntriesReadInstruction,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = InferPapiStorageEntries<
  TypedApi<TDescriptor>["query"][TInstruction["pallet"]][TInstruction["storage"]]
>["response"];

type ApiCallResponse<
  TInstruction extends
    | ApiCallInstruction
    | MultiInstruction<ApiCallInstruction>,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = InferPapiRuntimeCall<
  TypedApi<TDescriptor>["apis"][TInstruction["pallet"]][TInstruction["api"]]
>["response"];

type InferContractReadResponse<
  T extends ContractReadInstruction | MultiContractReadInstruction,
> = InferInkInstructionsPayload<
  T["instructions"],
  DescriptorOfContract<T["contract"]>
>;

export type InferInstructionResponse<
  TInstruction extends QueryInstruction,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = TInstruction extends ConstantFetchInstruction
  ? ConstantFetchPayload<TInstruction, TDescriptor>
  : TInstruction extends MultiInstruction<StorageReadInstruction>
    ? Array<
        true extends TInstruction["directives"]["stream"]
          ? StorageReadResponse<TInstruction, TDescriptor> | typeof pending
          : StorageReadResponse<TInstruction, TDescriptor>
      >
    : TInstruction extends StorageReadInstruction
      ? StorageReadResponse<TInstruction, TDescriptor>
      : TInstruction extends StorageEntriesReadInstruction
        ? StorageEntriesReadResponse<TInstruction, TDescriptor>
        : TInstruction extends MultiInstruction<ApiCallInstruction>
          ? Array<
              true extends TInstruction["directives"]["stream"]
                ? ApiCallResponse<TInstruction, TDescriptor> | typeof pending
                : ApiCallResponse<TInstruction, TDescriptor>
            >
          : TInstruction extends ApiCallInstruction
            ? ApiCallResponse<TInstruction, TDescriptor>
            : TInstruction extends MultiContractReadInstruction
              ? Array<
                  true extends TInstruction["directives"]["stream"]
                    ? InferContractReadResponse<TInstruction> | typeof pending
                    : InferContractReadResponse<TInstruction>
                >
              : TInstruction extends ContractReadInstruction
                ? InferContractReadResponse<TInstruction>
                : never;

type ResponsePayload<T> =
  T extends Promise<infer Payload>
    ? Payload
    : T extends Observable<infer Payload>
      ? Payload
      : T extends Array<infer _>
        ? { [P in keyof T]: ResponsePayload<T[P]> }
        : T;

export type InferInstructionPayload<
  TInstruction extends QueryInstruction,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = ResponsePayload<InferInstructionResponse<TInstruction, TDescriptor>>;

export type InferInstructionsResponse<
  TInstructions extends QueryInstruction[],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = {
  [P in keyof TInstructions]: InferInstructionResponse<
    TInstructions[P],
    TDescriptor
  >;
};

export type InferInstructionsPayload<
  TInstructions extends QueryInstruction[],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = Extract<
  {
    [P in keyof TInstructions]: InferInstructionPayload<
      TInstructions[P],
      TDescriptor
    >;
  },
  unknown[]
>;

export type InferQueryResponse<T extends Query> =
  T extends Query<infer Instructions, infer Descriptor>
    ? InferInstructionsResponse<Instructions, Descriptor>
    : never;

export type InferQueryPayload<T extends Query> =
  T extends Query<infer Instructions, infer Descriptor>
    ? FlatHead<InferInstructionsPayload<Instructions, Descriptor>>
    : never;

export class Query<
  TInstructions extends QueryInstruction[] = QueryInstruction[],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> {
  readonly #instructions: TInstructions;

  constructor(
    instructions: TInstructions = [] as QueryInstruction[] as TInstructions,
  ) {
    this.#instructions = instructions;
  }

  get instructions() {
    return Object.freeze(this.#instructions.slice()) as TInstructions;
  }

  constant<
    const TPallet extends StringKeyOf<TypedApi<TDescriptor>["constants"]>,
    const TConstant extends StringKeyOf<
      TypedApi<TDescriptor>["constants"][TPallet]
    >,
  >(pallet: TPallet, constant: TConstant) {
    return this.#append({
      instruction: "get-constant",
      pallet,
      constant,
    });
  }

  /**
   * @deprecated Use {@link Query.constant} instead.
   */
  getConstant = this.constant;

  storage<
    const TPallet extends StringKeyOf<TypedApi<TDescriptor>["query"]>,
    const TStorage extends StringKeyOf<TypedApi<TDescriptor>["query"][TPallet]>,
  >(
    pallet: TPallet,
    storage: TStorage,
    ...[args, options]: InferPapiStorageEntry<
      TypedApi<TDescriptor>["query"][TPallet][TStorage]
    >["args"] extends []
      ? [
          args?: InferPapiStorageEntry<
            TypedApi<TDescriptor>["query"][TPallet][TStorage]
          >["args"],
          options?: { at?: At },
        ]
      : [
          args: InferPapiStorageEntry<
            TypedApi<TDescriptor>["query"][TPallet][TStorage]
          >["args"],
          options?: { at?: At },
        ]
  ) {
    return this.#append({
      instruction: "read-storage",
      pallet,
      storage,
      args: args ?? [],
      at: options?.at,
    } satisfies StorageReadInstruction);
  }

  /**
   * @deprecated Use {@link Query.storage} instead.
   */
  readStorage = this.storage;

  storages<
    const TPallet extends StringKeyOf<TypedApi<TDescriptor>["query"]>,
    const TStorage extends StringKeyOf<TypedApi<TDescriptor>["query"][TPallet]>,
    const TStream extends boolean = false,
  >(
    pallet: TPallet,
    storage: TStorage,
    args: Array<
      InferPapiStorageEntry<
        TypedApi<TDescriptor>["query"][TPallet][TStorage]
      >["args"]
    >,
    options?: { at?: At; stream?: TStream },
  ) {
    return this.#append({
      instruction: "read-storage",
      pallet,
      storage,
      args,
      at: options?.at,
      multi: true,
      directives: {
        stream: options?.stream as NoInfer<TStream>,
      },
    } satisfies MultiInstruction<StorageReadInstruction>);
  }

  /**
   * @deprecated Use {@link Query.storages} instead.
   */
  readStorages = this.storages;

  storageEntries<
    const TPallet extends StringKeyOf<TypedApi<TDescriptor>["query"]>,
    const TStorage extends StringKeyOf<TypedApi<TDescriptor>["query"][TPallet]>,
  >(
    pallet: TPallet,
    storage: TStorage,
    args?: InferPapiStorageEntries<
      TypedApi<TDescriptor>["query"][TPallet][TStorage]
    >["args"],
    options?: { at?: At },
  ) {
    return this.#append({
      instruction: "read-storage-entries",
      pallet,
      storage,
      args: args ?? [],
      at: options?.at,
    } satisfies StorageEntriesReadInstruction);
  }

  /**
   * @deprecated Use {@link Query.storageEntries} instead.
   */
  readStorageEntries = this.storageEntries;

  runtimeApi<
    const TPallet extends StringKeyOf<TypedApi<TDescriptor>["apis"]>,
    const TApi extends StringKeyOf<TypedApi<TDescriptor>["apis"][TPallet]>,
  >(
    pallet: TPallet,
    api: TApi,
    ...[args, options]: InferPapiRuntimeCall<
      TypedApi<TDescriptor>["apis"][TPallet][TApi]
    >["args"] extends []
      ? [
          args?: InferPapiRuntimeCall<
            TypedApi<TDescriptor>["apis"][TPallet][TApi]
          >["args"],
          options?: { at?: Finality },
        ]
      : [
          args: InferPapiRuntimeCall<
            TypedApi<TDescriptor>["apis"][TPallet][TApi]
          >["args"],
          options?: { at?: Finality },
        ]
  ) {
    return this.#append({
      instruction: "call-api",
      pallet,
      api,
      args: args ?? [],
      at: options?.at,
    } satisfies ApiCallInstruction);
  }

  /**
   * @deprecated Use {@link Query.runtimeApi} instead.
   */
  callApi = this.runtimeApi;

  runtimeApis<
    const TPallet extends StringKeyOf<TypedApi<TDescriptor>["apis"]>,
    const TApi extends StringKeyOf<TypedApi<TDescriptor>["apis"][TPallet]>,
    const TStream extends boolean = false,
  >(
    pallet: TPallet,
    api: TApi,
    args: Array<
      InferPapiRuntimeCall<TypedApi<TDescriptor>["apis"][TPallet][TApi]>["args"]
    >,
    options?: { at?: Finality; stream?: TStream },
  ) {
    return this.#append({
      instruction: "call-api",
      pallet,
      api,
      args,
      at: options?.at,
      multi: true,
      directives: {
        stream: options?.stream as NoInfer<TStream>,
      },
    } satisfies MultiInstruction<ApiCallInstruction>);
  }

  /**
   * @deprecated Use {@link Query.runtimeApis} instead.
   */
  callApis = this.runtimeApis;

  /** @experimental */
  contract<
    TContractDescriptor extends GenericInkDescriptors,
    TContractInstructions extends InkQueryInstruction[],
  >(
    contract: Contract<TContractDescriptor>,
    address: string,
    builder: (
      query: InkQuery<TContractDescriptor, []>,
    ) => InkQuery<TContractDescriptor, TContractInstructions>,
  ) {
    return this.#append({
      instruction: "read-contract",
      contract,
      address,
      instructions: builder(new InkQuery()).instructions,
    } satisfies ContractReadInstruction);
  }

  /** @experimental */
  contracts<
    TContractDescriptor extends GenericInkDescriptors,
    TContractInstructions extends InkQueryInstruction[],
    const TStream extends boolean = false,
  >(
    contract: Contract<TContractDescriptor>,
    addresses: string[],
    builder: (
      query: InkQuery<TContractDescriptor, []>,
    ) => InkQuery<TContractDescriptor, TContractInstructions>,
    options?: {
      stream?: TStream;
    },
  ) {
    return this.#append({
      instruction: "read-contract",
      multi: true,
      directives: {
        stream: options?.stream as NoInfer<TStream>,
      },
      contract,
      addresses,
      instructions: builder(new InkQuery()).instructions,
    } satisfies MultiContractReadInstruction);
  }

  concat<TQueries extends Query[]>(...queries: TQueries) {
    return new Query(
      this.#instructions.concat(...queries.map((query) => query.#instructions)),
    ) as Query<
      // @ts-expect-error TODO: fix this
      [
        ...TInstructions,
        ...Flatten<{
          [P in keyof TQueries]: TQueries[P] extends Query<
            infer Instructions,
            infer _
          >
            ? Instructions
            : never;
        }>,
      ],
      TDescriptor
    >;
  }

  #append<TInstruction extends QueryInstruction>(instruction: TInstruction) {
    return new Query([...this.#instructions, instruction]) as Query<
      [...TInstructions, TInstruction],
      TDescriptor
    >;
  }
}
