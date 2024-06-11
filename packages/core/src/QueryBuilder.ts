/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReDotDescriptor } from "@reactive-dot/types";
import type { ChainDefinition, TypedApi } from "polkadot-api";
import { Observable } from "rxjs";

type InferPapiStorageEntry<T> = T extends {
  watchValue: (...args: infer Args) => Observable<infer Payload>;
}
  ? { args: Args; payload: Payload }
  : { args: unknown[]; payload: unknown };

type InferPapiStorageEntryWithKeys<T> = T extends {
  getEntries: (...args: infer Args) => Promise<infer Payload>;
}
  ? { args: Args; payload: Payload }
  : { args: unknown[]; payload: unknown };

type InferPapiRuntimeCall<T> = T extends (
  ...args: infer Args
) => Promise<infer Payload>
  ? { args: Args; payload: Payload }
  : { args: unknown[]; payload: unknown };

type InferPapiConstantEntry<T> = T extends {
  (): Promise<infer Payload>;
  (runtime: infer _): infer Payload;
}
  ? Payload
  : unknown;

type BaseInstruction<T extends string> = {
  instruction: T;
};

export type ConstantFetchInstruction<
  TPallet extends keyof TypedApi<TDescriptor>["constants"],
  TConstant extends keyof TypedApi<TDescriptor>["constants"][TPallet],
  TDescriptor extends ChainDefinition = ReDotDescriptor,
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
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> = BaseInstruction<"read-storage"> & {
  pallet: TPallet;
  storage: TStorage;
  args: TArguments;
};

export type StorageEntriesReadInstruction<
  TPallet extends keyof TypedApi<TDescriptor>["query"],
  TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
  TArguments extends InferPapiStorageEntryWithKeys<
    TypedApi<TDescriptor>["query"][TPallet][TStorage]
  >["args"],
  TDescriptor extends ChainDefinition = ReDotDescriptor,
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
  TDescriptor extends ChainDefinition = ReDotDescriptor,
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
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> =
  | ConstantFetchInstruction<any, any, TDescriptor>
  | StorageReadInstruction<any, any, any, TDescriptor>
  | MultiInstruction<StorageReadInstruction<any, any, any, TDescriptor>>
  | StorageEntriesReadInstruction<any, any, any, TDescriptor>
  | ApiCallInstruction<any, any, any, TDescriptor>
  | MultiInstruction<ApiCallInstruction<any, any, any, TDescriptor>>;

type ConstantFetchPayload<
  TInstruction extends ConstantFetchInstruction<any, any, TDescriptor>,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> = InferPapiConstantEntry<
  TypedApi<TDescriptor>["constants"][TInstruction["pallet"]][TInstruction["constant"]]
>;

type StorageReadPayload<
  TInstruction extends
    | StorageReadInstruction<any, any, any, TDescriptor>
    | MultiInstruction<StorageReadInstruction<any, any, any, TDescriptor>>,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> = InferPapiStorageEntry<
  TypedApi<TDescriptor>["query"][TInstruction["pallet"]][TInstruction["storage"]]
>["payload"];

type StorageEntriesReadPayload<
  TInstruction extends StorageEntriesReadInstruction<
    any,
    any,
    any,
    TDescriptor
  >,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> = InferPapiStorageEntryWithKeys<
  TypedApi<TDescriptor>["query"][TInstruction["pallet"]][TInstruction["storage"]]
>["payload"];

type ApiCallPayload<
  TInstruction extends
    | ApiCallInstruction<any, any, any, TDescriptor>
    | MultiInstruction<ApiCallInstruction<any, any, any, TDescriptor>>,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> = InferPapiRuntimeCall<
  TypedApi<TDescriptor>["apis"][TInstruction["pallet"]][TInstruction["api"]]
>["payload"];

export type InferInstruction<
  TInstruction extends QueryInstruction,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> =
  TInstruction extends ConstantFetchInstruction<any, any, TDescriptor>
    ? ConstantFetchPayload<TInstruction, TDescriptor>
    : TInstruction extends MultiInstruction<
          StorageReadInstruction<any, any, any, TDescriptor>
        >
      ? Array<StorageReadPayload<TInstruction, TDescriptor>>
      : TInstruction extends StorageReadInstruction<any, any, any, TDescriptor>
        ? StorageReadPayload<TInstruction, TDescriptor>
        : TInstruction extends StorageEntriesReadInstruction<
              any,
              any,
              any,
              TDescriptor
            >
          ? StorageEntriesReadPayload<TInstruction, TDescriptor>
          : TInstruction extends MultiInstruction<
                ApiCallInstruction<any, any, any, TDescriptor>
              >
            ? Array<ApiCallPayload<TInstruction, TDescriptor>>
            : TInstruction extends ApiCallInstruction<
                  any,
                  any,
                  any,
                  TDescriptor
                >
              ? ApiCallPayload<TInstruction, TDescriptor>
              : never;

export type InferInstructions<
  TInstructions extends QueryInstruction[],
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> = {
  [P in keyof TInstructions]: InferInstruction<TInstructions[P], TDescriptor>;
};

export type InferQueryBuilder<T extends QueryBuilder> =
  T extends QueryBuilder<infer Instructions, infer Descriptor>
    ? InferInstructions<Instructions, Descriptor>
    : never;

export default class QueryBuilder<
  const TInstructions extends QueryInstruction[] = QueryInstruction[],
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> {
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
    return new QueryBuilder([
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
    return new QueryBuilder([
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
    return new QueryBuilder([
      ...this.#instructions,
      { instruction: "read-storage", pallet, storage, args, multi: true },
    ]);
  }

  readStorageEntries<
    TPallet extends keyof TypedApi<TDescriptor>["query"],
    TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
    TArguments extends Array<
      InferPapiStorageEntryWithKeys<
        TypedApi<TDescriptor>["query"][TPallet][TStorage]
      >["args"]
    >,
  >(pallet: TPallet, storage: TStorage, args: TArguments) {
    return new QueryBuilder([
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
    return new QueryBuilder([
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
    return new QueryBuilder([
      ...this.#instructions,
      { instruction: "call-api", pallet, api, args, multi: true },
    ]);
  }
}
