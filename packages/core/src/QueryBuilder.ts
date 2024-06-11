/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReDotDescriptor } from "@reactive-dot/types";
import type {
  TypedApi,
  StorageEntry,
  StorageEntryWithKeys,
  ChainDefinition,
  RuntimeCall,
  ConstantEntry,
} from "polkadot-api";

type PossibleParents<A extends Array<any>> = A extends [...infer Left, any]
  ? Left | PossibleParents<Left>
  : [];

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
  TArguments extends
    TypedApi<TDescriptor>["query"][TPallet][TStorage] extends StorageEntry<
      infer Args,
      any
    >
      ? Args
      : unknown[],
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> = BaseInstruction<"read-storage"> & {
  pallet: TPallet;
  storage: TStorage;
  args: TArguments;
};

export type StorageEntriesReadInstruction<
  TPallet extends keyof TypedApi<TDescriptor>["query"],
  TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
  TArguments extends
    TypedApi<TDescriptor>["query"][TPallet][TStorage] extends StorageEntry<
      infer Args,
      any
    >
      ? Args
      : unknown[],
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> = BaseInstruction<"read-storage-entries"> & {
  pallet: TPallet;
  storage: TStorage;
  args: TArguments;
};

export type ApiCallInstruction<
  TPallet extends keyof TypedApi<TDescriptor>["apis"],
  TApi extends keyof TypedApi<TDescriptor>["apis"][TPallet],
  TArguments extends
    TypedApi<TDescriptor>["apis"][TPallet][TApi] extends RuntimeCall<
      infer Args,
      any
    >
      ? Args
      : unknown[],
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
> =
  TypedApi<TDescriptor>["constants"][TInstruction["pallet"]][TInstruction["constant"]] extends ConstantEntry<
    infer Payload
  >
    ? Payload
    : never;

type StorageReadPayload<
  TInstruction extends
    | StorageReadInstruction<any, any, any, TDescriptor>
    | MultiInstruction<StorageReadInstruction<any, any, any, TDescriptor>>,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> =
  TypedApi<TDescriptor>["query"][TInstruction["pallet"]][TInstruction["storage"]] extends StorageEntry<
    any,
    infer Payload
  >
    ? Payload
    : unknown;

type StorageEntriesReadPayload<
  TInstruction extends StorageEntriesReadInstruction<
    any,
    any,
    any,
    TDescriptor
  >,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> =
  TypedApi<TDescriptor>["query"][TInstruction["pallet"]][TInstruction["storage"]] extends StorageEntryWithKeys<
    infer Args,
    infer Payload
  >
    ? Array<{
        keyArgs: Args;
        value: NonNullable<Payload>;
      }>
    : unknown;

type ApiCallPayload<
  TInstruction extends
    | ApiCallInstruction<any, any, any, TDescriptor>
    | MultiInstruction<ApiCallInstruction<any, any, any, TDescriptor>>,
  TDescriptor extends ChainDefinition = ReDotDescriptor,
> =
  TypedApi<TDescriptor>["apis"][TInstruction["pallet"]][TInstruction["api"]] extends RuntimeCall<
    any,
    infer Payload
  >
    ? Payload
    : unknown;

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
    TArguments extends
      TypedApi<TDescriptor>["query"][TPallet][TStorage] extends StorageEntry<
        infer Args,
        any
      >
        ? Args
        : unknown[],
  >(pallet: TPallet, storage: TStorage, args: TArguments) {
    return new QueryBuilder([
      ...this.#instructions,
      { instruction: "read-storage", pallet, storage, args },
    ]);
  }

  readStorages<
    TPallet extends keyof TypedApi<TDescriptor>["query"],
    TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
    TArguments extends
      TypedApi<TDescriptor>["query"][TPallet][TStorage] extends StorageEntry<
        infer Args,
        any
      >
        ? Args
        : unknown[],
  >(pallet: TPallet, storage: TStorage, args: TArguments[]) {
    return new QueryBuilder([
      ...this.#instructions,
      { instruction: "read-storage", pallet, storage, args, multi: true },
    ]);
  }

  readStorageEntries<
    TPallet extends keyof TypedApi<TDescriptor>["query"],
    TStorage extends keyof TypedApi<TDescriptor>["query"][TPallet],
    TArguments extends
      TypedApi<TDescriptor>["query"][TPallet][TStorage] extends StorageEntryWithKeys<
        infer Args,
        any
      >
        ? PossibleParents<Args>
        : unknown[],
  >(pallet: TPallet, storage: TStorage, args: TArguments) {
    return new QueryBuilder([
      ...this.#instructions,
      { instruction: "read-storage-entries", pallet, storage, args },
    ]);
  }

  callApi<
    TPallet extends keyof TypedApi<TDescriptor>["apis"],
    TApi extends keyof TypedApi<TDescriptor>["apis"][TPallet],
    TArguments extends
      TypedApi<TDescriptor>["apis"][TPallet][TApi] extends RuntimeCall<
        infer Args,
        any
      >
        ? Args
        : unknown[],
  >(pallet: TPallet, api: TApi, args: TArguments) {
    return new QueryBuilder([
      ...this.#instructions,
      { instruction: "call-api", pallet, api, args },
    ]);
  }

  callApis<
    TPallet extends keyof TypedApi<TDescriptor>["apis"],
    TApi extends keyof TypedApi<TDescriptor>["apis"][TPallet],
    TArguments extends
      TypedApi<TDescriptor>["apis"][TPallet][TApi] extends RuntimeCall<
        infer Args,
        any
      >
        ? Args
        : unknown[],
  >(pallet: TPallet, api: TApi, args: TArguments[]) {
    return new QueryBuilder([
      ...this.#instructions,
      { instruction: "call-api", pallet, api, args, multi: true },
    ]);
  }
}
