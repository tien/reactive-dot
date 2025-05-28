import type { CommonDescriptor } from "./chains.js";
import type { Contract, DescriptorOfContract } from "./ink/contract.js";
import {
  type InferInkInstructionsPayload,
  InkQuery,
  type InkQueryInstruction,
} from "./ink/query-builder.js";
import type { GenericInkDescriptors } from "./ink/types.js";
import type { At, Finality, FlatHead, Flatten, StringKeyOf } from "./types.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import type { Observable } from "rxjs";

type PapiCallOptions = Partial<{
  at: string;
  signal: AbortSignal;
}>;

type OmitCallOptions<T extends readonly unknown[]> = T extends [
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

export type BaseInstruction<T extends string> = {
  instruction: T;
};

export type ConstantFetchInstruction<
  TPallet extends string = string,
  TConstant extends string = string,
> = BaseInstruction<"get-constant"> & {
  pallet: TPallet;
  constant: TConstant;
};

export type StorageReadInstruction<
  TPallet extends string = string,
  TStorage extends string = string,
  TArguments extends unknown[] = unknown[],
> = BaseInstruction<"read-storage"> & {
  pallet: TPallet;
  storage: TStorage;
  args: TArguments;
  at: At | undefined;
};

export type StorageEntriesReadInstruction<
  TPallet extends string = string,
  TStorage extends string = string,
  TArguments extends unknown[] = unknown[],
> = BaseInstruction<"read-storage-entries"> & {
  pallet: TPallet;
  storage: TStorage;
  args: TArguments;
  at: At | undefined;
};

export type ApiCallInstruction<
  TPallet extends string = string,
  TApi extends string = string,
  TArguments extends unknown[] = unknown[],
> = BaseInstruction<"call-api"> & {
  pallet: TPallet;
  api: TApi;
  args: TArguments;
  at: Finality | undefined;
};

export type ContractReadInstruction<
  TContract extends Contract = Contract,
  TInstructions extends InkQuery<
    TContract extends Contract<infer Descriptor> ? Descriptor : never
  >["instructions"] = InkQuery<
    TContract extends Contract<infer Descriptor> ? Descriptor : never
  >["instructions"],
> = BaseInstruction<"read-contract"> & {
  contract: TContract;
  address: string;
  instructions: TInstructions;
};

export type MultiContractReadInstruction<
  TContract extends Contract = Contract,
  TInstructions extends InkQuery<
    TContract extends Contract<infer Descriptor> ? Descriptor : never
  >["instructions"] = InkQuery<
    TContract extends Contract<infer Descriptor> ? Descriptor : never
  >["instructions"],
> = Omit<ContractReadInstruction<TContract, TInstructions>, "address"> & {
  multi: true;
  addresses: string[];
};

export type MultiInstruction<
  TInstruction extends BaseInstruction<string> & { args: unknown[] },
> = Omit<TInstruction, "args"> & {
  multi: true;
  args: unknown[][];
};

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
    ? Array<StorageReadResponse<TInstruction, TDescriptor>>
    : TInstruction extends StorageReadInstruction
      ? StorageReadResponse<TInstruction, TDescriptor>
      : TInstruction extends StorageEntriesReadInstruction
        ? StorageEntriesReadResponse<TInstruction, TDescriptor>
        : TInstruction extends MultiInstruction<ApiCallInstruction>
          ? Array<ApiCallResponse<TInstruction, TDescriptor>>
          : TInstruction extends ApiCallInstruction
            ? ApiCallResponse<TInstruction, TDescriptor>
            : TInstruction extends MultiContractReadInstruction
              ? Array<InferContractReadResponse<TInstruction>>
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
  TInstructions extends readonly QueryInstruction[],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = {
  [P in keyof TInstructions]: InferInstructionResponse<
    TInstructions[P],
    TDescriptor
  >;
};

export type InferInstructionsPayload<
  TInstructions extends readonly QueryInstruction[],
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
  const TInstructions extends
    readonly QueryInstruction[] = readonly QueryInstruction[],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> {
  readonly #instructions: TInstructions;

  constructor(
    instructions: TInstructions = [] as readonly QueryInstruction[] as TInstructions,
  ) {
    this.#instructions = instructions;
  }

  get instructions() {
    return Object.freeze(this.#instructions.slice()) as TInstructions;
  }

  constant<
    TPallet extends StringKeyOf<TypedApi<TDescriptor>["constants"]>,
    TConstant extends StringKeyOf<TypedApi<TDescriptor>["constants"][TPallet]>,
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
    TPallet extends StringKeyOf<TypedApi<TDescriptor>["query"]>,
    TStorage extends StringKeyOf<TypedApi<TDescriptor>["query"][TPallet]>,
    TArguments extends InferPapiStorageEntry<
      TypedApi<TDescriptor>["query"][TPallet][TStorage]
    >["args"],
  >(
    pallet: TPallet,
    storage: TStorage,
    ...argsAndOptions: TArguments extends []
      ? [args?: TArguments, options?: { at?: At }]
      : [args: TArguments, options?: { at?: At }]
  ) {
    const [args, options] = argsAndOptions as [
      TArguments | undefined,
      { at?: At } | undefined,
    ];

    return this.#append({
      instruction: "read-storage",
      pallet,
      storage,
      args: args ?? [],
      at: options?.at,
    });
  }

  /**
   * @deprecated Use {@link Query.storage} instead.
   */
  readStorage = this.storage;

  storages<
    TPallet extends StringKeyOf<TypedApi<TDescriptor>["query"]>,
    TStorage extends StringKeyOf<TypedApi<TDescriptor>["query"][TPallet]>,
    TArguments extends InferPapiStorageEntry<
      TypedApi<TDescriptor>["query"][TPallet][TStorage]
    >["args"],
  >(
    pallet: TPallet,
    storage: TStorage,
    args: TArguments[],
    options?: { at?: At },
  ) {
    return this.#append({
      instruction: "read-storage",
      pallet,
      storage,
      args,
      at: options?.at,
      multi: true,
    });
  }

  /**
   * @deprecated Use {@link Query.storages} instead.
   */
  readStorages = this.storages;

  storageEntries<
    TPallet extends StringKeyOf<TypedApi<TDescriptor>["query"]>,
    TStorage extends StringKeyOf<TypedApi<TDescriptor>["query"][TPallet]>,
    TArguments extends InferPapiStorageEntries<
      TypedApi<TDescriptor>["query"][TPallet][TStorage]
    >["args"],
  >(
    pallet: TPallet,
    storage: TStorage,
    args?: TArguments,
    options?: { at?: At },
  ) {
    return this.#append({
      instruction: "read-storage-entries",
      pallet,
      storage,
      args: args ?? [],
      at: options?.at,
    });
  }

  /**
   * @deprecated Use {@link Query.storageEntries} instead.
   */
  readStorageEntries = this.storageEntries;

  runtimeApi<
    TPallet extends StringKeyOf<TypedApi<TDescriptor>["apis"]>,
    TApi extends StringKeyOf<TypedApi<TDescriptor>["apis"][TPallet]>,
    TArguments extends InferPapiRuntimeCall<
      TypedApi<TDescriptor>["apis"][TPallet][TApi]
    >["args"],
  >(
    pallet: TPallet,
    api: TApi,
    ...argsAndOptions: TArguments extends []
      ? [args?: TArguments, options?: { at?: Finality }]
      : [args: TArguments, options?: { at?: Finality }]
  ) {
    const [args, options] = argsAndOptions as [
      TArguments | undefined,
      { at?: Finality } | undefined,
    ];

    return this.#append({
      instruction: "call-api",
      pallet,
      api,
      args: args ?? [],
      at: options?.at,
    });
  }

  /**
   * @deprecated Use {@link Query.runtimeApi} instead.
   */
  callApi = this.runtimeApi;

  runtimeApis<
    TPallet extends StringKeyOf<TypedApi<TDescriptor>["apis"]>,
    TApi extends StringKeyOf<TypedApi<TDescriptor>["apis"][TPallet]>,
    TArguments extends InferPapiRuntimeCall<
      TypedApi<TDescriptor>["apis"][TPallet][TApi]
    >["args"],
  >(
    pallet: TPallet,
    api: TApi,
    args: TArguments[],
    options?: { at?: Finality },
  ) {
    return this.#append({
      instruction: "call-api",
      pallet,
      api,
      args,
      at: options?.at,
      multi: true,
    });
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
    });
  }

  /** @experimental */
  contracts<
    TContractDescriptor extends GenericInkDescriptors,
    TContractInstructions extends InkQueryInstruction[],
  >(
    contract: Contract<TContractDescriptor>,
    addresses: string[],
    builder: (
      query: InkQuery<TContractDescriptor, []>,
    ) => InkQuery<TContractDescriptor, TContractInstructions>,
  ) {
    return this.#append({
      instruction: "read-contract",
      multi: true,
      contract,
      addresses,
      instructions: builder(new InkQuery()).instructions,
    });
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

  #append<const TInstruction extends QueryInstruction>(
    instruction: TInstruction,
  ) {
    return new Query([...this.#instructions, instruction]) as Query<
      [...TInstructions, TInstruction],
      TDescriptor
    >;
  }
}
