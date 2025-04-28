/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import type {
  ExtractExactProperties,
  StringKeyOf,
  UndefinedToOptional,
} from "../types.js";
import type {
  Event,
  InkCallableDescriptor,
  InkDescriptors,
  InkStorageDescriptor,
} from "@polkadot-api/ink-contracts";
import type {
  ApisTypedef,
  Binary,
  Enum,
  FixedSizeBinary,
  PalletsTypedef,
  ResultPayload,
  RuntimeDescriptor,
  SS58String,
  StorageDescriptor,
  TxDescriptor,
  TypedApi,
} from "polkadot-api";

export type MultiAddress = Enum<{
  Id: SS58String;
  Index: undefined;
  Raw: Binary;
  Address32: FixedSizeBinary<32>;
  Address20: FixedSizeBinary<20>;
}>;

export type Gas = {
  ref_time: bigint;
  proof_size: bigint;
};

export type StorageError = Enum<{
  DoesntExist: undefined;
  KeyDecodingFailed: undefined;
  MigrationInProgress: undefined;
}>;

export type InkApis<TEvent = any, TError = any> = ApisTypedef<{
  ContractsApi: {
    call: RuntimeDescriptor<
      [
        origin: SS58String,
        dest: SS58String,
        value: bigint,
        gas_limit: Gas | undefined,
        storage_deposit_limit: bigint | undefined,
        input_data: Binary,
      ],
      {
        gas_consumed: Gas;
        gas_required: Gas;
        storage_deposit: Enum<{
          Refund: bigint;
          Charge: bigint;
        }>;
        debug_message: Binary;
        result: ResultPayload<
          {
            flags: number;
            data: Binary;
          },
          TError
        >;
        events?: Array<TEvent>;
      }
    >;
    instantiate: RuntimeDescriptor<
      [
        origin: SS58String,
        value: bigint,
        gas_limit: Gas | undefined,
        storage_deposit_limit: bigint | undefined,
        code: Enum<{
          Upload: Binary;
          Existing: FixedSizeBinary<32>;
        }>,
        data: Binary,
        salt: Binary,
      ],
      {
        gas_consumed: Gas;
        gas_required: Gas;
        storage_deposit: Enum<{
          Refund: bigint;
          Charge: bigint;
        }>;
        debug_message: Binary;
        result: ResultPayload<
          {
            result: {
              flags: number;
              data: Binary;
            };
            account_id: SS58String;
          },
          TError
        >;
        events?: Array<TEvent>;
      }
    >;
    get_storage: RuntimeDescriptor<
      [address: SS58String, key: Binary],
      ResultPayload<Binary | undefined, StorageError>
    >;
  };
}>;

export type InkPallets = PalletsTypedef<
  {
    Contracts: {
      ContractInfoOf: StorageDescriptor<
        [Key: SS58String],
        {
          code_hash: FixedSizeBinary<32>;
        },
        true,
        never
      >;
    };
  },
  {
    Contracts: {
      call: TxDescriptor<{
        dest: MultiAddress;
        value: bigint;
        gas_limit: Gas;
        storage_deposit_limit: bigint | undefined;
        data: Binary;
      }>;
      instantiate: TxDescriptor<{
        value: bigint;
        gas_limit: Gas;
        storage_deposit_limit: bigint | undefined;
        code_hash: FixedSizeBinary<32>;
        data: Binary;
        salt: Binary;
      }>;
      instantiate_with_code: TxDescriptor<{
        value: bigint;
        gas_limit: Gas;
        storage_deposit_limit: bigint | undefined;
        code: Binary;
        data: Binary;
        salt: Binary;
      }>;
    };
  },
  {},
  {},
  {}
>;

export type GenericDefinition<TPallet, TApis> = {
  descriptors: Promise<any> & {
    pallets: TPallet;
    apis: TApis;
  };
  asset: any;
  metadataTypes: any;
  getMetadata: any;
  genesis: any;
};

export type GenericInkDescriptors = InkDescriptors<
  InkStorageDescriptor,
  InkCallableDescriptor,
  InkCallableDescriptor,
  Event
>;

export type InkCompatApi = TypedApi<GenericDefinition<InkPallets, InkApis>>;

export type MessageOfDescriptor<
  T extends GenericInkDescriptors,
  TMessageName extends string,
> = T["__types"]["messages"][TMessageName];

export type InkTxBody<
  TDescriptor extends GenericInkDescriptors,
  TMessageName extends StringKeyOf<
    ExtractExactProperties<
      TDescriptor["__types"]["messages"],
      { mutates: true }
    >
  >,
> = UndefinedToOptional<{
  data: {} extends MessageOfDescriptor<TDescriptor, TMessageName>["message"]
    ? undefined
    : MessageOfDescriptor<TDescriptor, TMessageName>["message"];
  value: MessageOfDescriptor<TDescriptor, TMessageName>["payable"] extends true
    ? bigint
    : Extract<
          MessageOfDescriptor<TDescriptor, TMessageName>["payable"],
          false | undefined
        > extends never
      ? undefined
      : bigint | undefined;
}>;
