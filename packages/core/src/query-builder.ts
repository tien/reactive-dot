/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonDescriptor } from "./chains.js";
import type { Flatten } from "./types.js";
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

type Finality = "best" | "finalized";

type At = Finality | `0x${string}`;

type BaseInstruction<T extends string> = {
  instruction: T;
};

export type ConstantFetchInstruction<
  TPallet extends keyof TypedApi<TDescriptor>["constants"],
  TConstant extends keyof TypedApi<TDescriptor>["constants"][TPallet],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = BaseInstruction<"get-constant"> & {
  pallet: TPallet;
  constant: TConstant;
};

export type StorageReadInstruction<
  TPallet extends keyof TypedApi<TDescriptor>["query"],
  TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
  TArguments extends InferPapiStorageEntry<
    TypedApi<TDescriptor>["query"][TPallet][TStorage]
  >["args"],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = BaseInstruction<"read-storage"> & {
  pallet: TPallet;
  storage: TStorage;
  args: TArguments;
  at: At | undefined;
};

export type StorageEntriesReadInstruction<
  TPallet extends keyof TypedApi<TDescriptor>["query"],
  TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
  TArguments extends InferPapiStorageEntries<
    TypedApi<TDescriptor>["query"][TPallet][TStorage]
  >["args"],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = BaseInstruction<"read-storage-entries"> & {
  pallet: TPallet;
  storage: TStorage;
  args: TArguments;
  at: At | undefined;
};

export type ApiCallInstruction<
  TPallet extends keyof TypedApi<TDescriptor>["apis"],
  TApi extends keyof TypedApi<TDescriptor>["apis"][TPallet],
  TArguments extends InferPapiRuntimeCall<
    TypedApi<TDescriptor>["apis"][TPallet][TApi]
  >["args"],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = BaseInstruction<"call-api"> & {
  pallet: TPallet;
  api: TApi;
  args: TArguments;
  at: Finality | undefined;
};

export type MultiInstruction<TInstruction extends BaseInstruction<string>> =
  TInstruction & {
    multi: true;
  };

export type QueryInstruction<
  TDescriptor extends ChainDefinition = CommonDescriptor,
> =
  | ConstantFetchInstruction<any, any, TDescriptor>
  | StorageReadInstruction<any, any, any, TDescriptor>
  | MultiInstruction<StorageReadInstruction<any, any, any, TDescriptor>>
  | StorageEntriesReadInstruction<any, any, any, TDescriptor>
  | ApiCallInstruction<any, any, any, TDescriptor>
  | MultiInstruction<ApiCallInstruction<any, any, any, TDescriptor>>;

type ConstantFetchPayload<
  TInstruction extends ConstantFetchInstruction<any, any, TDescriptor>,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = InferPapiConstantEntry<
  TypedApi<TDescriptor>["constants"][TInstruction["pallet"]][TInstruction["constant"]]
>;

type StorageReadResponse<
  TInstruction extends
    | StorageReadInstruction<any, any, any, TDescriptor>
    | MultiInstruction<StorageReadInstruction<any, any, any, TDescriptor>>,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = InferPapiStorageEntry<
  TypedApi<TDescriptor>["query"][TInstruction["pallet"]][TInstruction["storage"]]
>["response"];

type StorageEntriesReadResponse<
  TInstruction extends StorageEntriesReadInstruction<
    any,
    any,
    any,
    TDescriptor
  >,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = InferPapiStorageEntries<
  TypedApi<TDescriptor>["query"][TInstruction["pallet"]][TInstruction["storage"]]
>["response"];

type ApiCallResponse<
  TInstruction extends
    | ApiCallInstruction<any, any, any, TDescriptor>
    | MultiInstruction<ApiCallInstruction<any, any, any, TDescriptor>>,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = InferPapiRuntimeCall<
  TypedApi<TDescriptor>["apis"][TInstruction["pallet"]][TInstruction["api"]]
>["response"];

export type InferInstructionResponse<
  TInstruction extends QueryInstruction,
  TDescriptor extends ChainDefinition = CommonDescriptor,
> =
  TInstruction extends ConstantFetchInstruction<any, any, TDescriptor>
    ? ConstantFetchPayload<TInstruction, TDescriptor>
    : TInstruction extends MultiInstruction<
          StorageReadInstruction<any, any, any, TDescriptor>
        >
      ? Array<StorageReadResponse<TInstruction, TDescriptor>>
      : TInstruction extends StorageReadInstruction<any, any, any, TDescriptor>
        ? StorageReadResponse<TInstruction, TDescriptor>
        : TInstruction extends StorageEntriesReadInstruction<
              any,
              any,
              any,
              TDescriptor
            >
          ? StorageEntriesReadResponse<TInstruction, TDescriptor>
          : TInstruction extends MultiInstruction<
                ApiCallInstruction<any, any, any, TDescriptor>
              >
            ? Array<ApiCallResponse<TInstruction, TDescriptor>>
            : TInstruction extends ApiCallInstruction<
                  any,
                  any,
                  any,
                  TDescriptor
                >
              ? ApiCallResponse<TInstruction, TDescriptor>
              : never;

type ResponsePayload<T> =
  T extends Promise<infer Payload>
    ? Payload
    : T extends Observable<infer Payload>
      ? Payload
      : T extends Array<infer Element>
        ? Array<ResponsePayload<Element>>
        : unknown;

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
> = {
  [P in keyof TInstructions]: InferInstructionPayload<
    TInstructions[P],
    TDescriptor
  >;
};

export type InferQueryResponse<T extends Query> =
  T extends Query<infer Instructions, infer Descriptor>
    ? InferInstructionsResponse<Instructions, Descriptor>
    : never;

export type InferQueryPayload<T extends Query> =
  T extends Query<infer Instructions, infer Descriptor>
    ? InferInstructionsPayload<Instructions, Descriptor>
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
    return Object.freeze(this.#instructions.slice());
  }

  constant<
    TPallet extends keyof TypedApi<TDescriptor>["constants"],
    TConstant extends keyof TypedApi<TDescriptor>["constants"][TPallet],
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
    TPallet extends keyof TypedApi<TDescriptor>["query"],
    TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
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
    TPallet extends keyof TypedApi<TDescriptor>["query"],
    TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
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
    TPallet extends keyof TypedApi<TDescriptor>["query"],
    TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
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
    TPallet extends keyof TypedApi<TDescriptor>["apis"],
    TApi extends keyof TypedApi<TDescriptor>["apis"][TPallet],
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
    TPallet extends keyof TypedApi<TDescriptor>["apis"],
    TApi extends keyof TypedApi<TDescriptor>["apis"][TPallet],
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
