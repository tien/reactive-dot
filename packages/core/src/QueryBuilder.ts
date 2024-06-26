/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CommonDescriptor } from "./config.js";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import type { Observable } from "rxjs";

type InferPapiStorageEntry<T> = T extends {
  watchValue: (...args: [...infer Args, infer Options]) => infer Response;
}
  ? { args: Args; options: Options; response: Response }
  : { args: unknown[]; options: unknown; response: unknown };

type InferPapiStorageEntries<T> = T extends {
  getEntries: (...args: [...infer Args, infer Options]) => infer Response;
}
  ? { args: Args; options: Options; response: Response }
  : { args: unknown[]; options: unknown; response: unknown };

type InferPapiRuntimeCall<T> = T extends (
  ...args: [...infer Args, infer Options]
) => infer Response
  ? { args: Args; options: Options; response: Response }
  : { args: unknown[]; options: unknown; response: unknown };

type InferPapiConstantEntry<T> = T extends {
  (): Promise<infer Payload>;
  (runtime: infer _): infer Payload;
}
  ? Promise<Payload>
  : unknown;

type BaseInstruction<T extends string> = {
  instruction: T;
};

export type ConstantFetchInstruction<
  TPallet extends keyof TypedApi<TDescriptor>["constants"],
  TConstant extends keyof TypedApi<TDescriptor>["constants"][TPallet],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> = BaseInstruction<"fetch-constant"> & {
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

export default class Query<
  const TInstructions extends QueryInstruction[] = QueryInstruction[],
  TDescriptor extends ChainDefinition = CommonDescriptor,
> implements Query<TInstructions>
{
  #instructions: TInstructions;

  constructor(instructions: TInstructions) {
    this.#instructions = instructions;
  }

  get instructions() {
    return Object.freeze(this.#instructions.slice()) as Readonly<TInstructions>;
  }

  fetchConstant<
    TPallet extends keyof TypedApi<TDescriptor>["constants"],
    TConstant extends keyof TypedApi<TDescriptor>["constants"][TPallet],
  >(pallet: TPallet, constant: TConstant) {
    return new Query([
      ...this.#instructions,
      { instruction: "fetch-constant", pallet, constant },
    ]);
  }

  readStorage<
    TPallet extends keyof TypedApi<TDescriptor>["query"],
    TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
    TArguments extends InferPapiStorageEntry<
      TypedApi<TDescriptor>["query"][TPallet][TStorage]
    >["args"],
  >(pallet: TPallet, storage: TStorage, args: TArguments) {
    return new Query([
      ...this.#instructions,
      { instruction: "read-storage", pallet, storage, args },
    ]);
  }

  readStorages<
    TPallet extends keyof TypedApi<TDescriptor>["query"],
    TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
    TArguments extends InferPapiStorageEntry<
      TypedApi<TDescriptor>["query"][TPallet][TStorage]
    >["args"],
  >(pallet: TPallet, storage: TStorage, args: TArguments[]) {
    return new Query([
      ...this.#instructions,
      { instruction: "read-storage", pallet, storage, args, multi: true },
    ]);
  }

  readStorageEntries<
    TPallet extends keyof TypedApi<TDescriptor>["query"],
    TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
    TArguments extends Array<
      InferPapiStorageEntries<
        TypedApi<TDescriptor>["query"][TPallet][TStorage]
      >["args"]
    >,
  >(pallet: TPallet, storage: TStorage, args: TArguments) {
    return new Query([
      ...this.#instructions,
      { instruction: "read-storage-entries", pallet, storage, args },
    ]);
  }

  callApi<
    TPallet extends keyof TypedApi<TDescriptor>["apis"],
    TApi extends keyof TypedApi<TDescriptor>["apis"][TPallet],
    TArguments extends InferPapiRuntimeCall<
      TypedApi<TDescriptor>["apis"][TPallet][TApi]
    >["args"],
  >(pallet: TPallet, api: TApi, args: TArguments) {
    return new Query([
      ...this.#instructions,
      { instruction: "call-api", pallet, api, args },
    ]);
  }

  callApis<
    TPallet extends keyof TypedApi<TDescriptor>["apis"],
    TApi extends keyof TypedApi<TDescriptor>["apis"][TPallet],
    TArguments extends InferPapiRuntimeCall<
      TypedApi<TDescriptor>["apis"][TPallet][TApi]
    >["args"],
  >(pallet: TPallet, api: TApi, args: TArguments[]) {
    return new Query([
      ...this.#instructions,
      { instruction: "call-api", pallet, api, args, multi: true },
    ]);
  }
}
