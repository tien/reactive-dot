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

export type ContractAddress = SS58String | `0x${string}` | FixedSizeBinary<20>;

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
  ReviveApi: {
    /**
     * Perform a call from a specified account to a given contract.
     *
     * See [`crate::Pallet::bare_call`].
     */
    call: RuntimeDescriptor<
      [
        origin: SS58String,
        dest: FixedSizeBinary<20>,
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
    /**
     * Query a given storage key in a given contract.
     *
     * Returns `Ok(Some(Vec<u8>))` if the storage value exists under the given key in the
     * specified account and `Ok(None)` if it doesn't. If the account specified by the address
     * doesn't exist, or doesn't have a contract then `Err` is returned.
     */
    get_storage: RuntimeDescriptor<
      [address: FixedSizeBinary<20>, key: FixedSizeBinary<32>],
      ResultPayload<
        Binary | undefined,
        Enum<{
          DoesntExist: undefined;
          KeyDecodingFailed: undefined;
        }>
      >
    >;
    /**
     * Query a given variable-sized storage key in a given contract.
     *
     * Returns `Ok(Some(Vec<u8>))` if the storage value exists under the given key in the
     * specified account and `Ok(None)` if it doesn't. If the account specified by the address
     * doesn't exist, or doesn't have a contract then `Err` is returned.
     */
    get_storage_var_key: RuntimeDescriptor<
      [address: FixedSizeBinary<20>, key: Binary],
      ResultPayload<
        Binary | undefined,
        Enum<{
          DoesntExist: undefined;
          KeyDecodingFailed: undefined;
        }>
      >
    >;
  };
}>;

export type InkPallets = PalletsTypedef<
  {
    Revive: {
      /**
       * A mapping from a contract's code hash to its code.
       */
      PristineCode: StorageDescriptor<
        [Key: FixedSizeBinary<32>],
        Binary,
        true,
        never
      >;
      /**
       * A mapping from a contract's code hash to its code info.
       */
      CodeInfoOf: StorageDescriptor<
        [Key: FixedSizeBinary<32>],
        {
          owner: SS58String;
          deposit: bigint;
          refcount: bigint;
          code_len: number;
          behaviour_version: number;
        },
        true,
        never
      >;
      /**
       * The code associated with a given account.
       */
      ContractInfoOf: StorageDescriptor<
        [Key: FixedSizeBinary<20>],
        {
          trie_id: Binary;
          code_hash: FixedSizeBinary<32>;
          storage_bytes: number;
          storage_items: number;
          storage_byte_deposit: bigint;
          storage_item_deposit: bigint;
          storage_base_deposit: bigint;
          immutable_data_len: number;
        },
        true,
        never
      >;
      /**
       * The immutable data associated with a given account.
       */
      ImmutableDataOf: StorageDescriptor<
        [Key: FixedSizeBinary<20>],
        Binary,
        true,
        never
      >;
      /**
       * Evicted contracts that await child trie deletion.
       *
       * Child trie deletion is a heavy operation depending on the amount of storage items
       * stored in said trie. Therefore this operation is performed lazily in `on_idle`.
       */
      DeletionQueue: StorageDescriptor<[Key: number], Binary, true, never>;
      /**
       * A pair of monotonic counters used to track the latest contract marked for deletion
       * and the latest deleted contract in queue.
       */
      DeletionQueueCounter: StorageDescriptor<
        [],
        {
          insert_counter: number;
          delete_counter: number;
        },
        false,
        never
      >;
      /**
       * Map a Ethereum address to its original `AccountId32`.
       *
       * Stores the last 12 byte for addresses that were originally an `AccountId32` instead
       * of an `H160`. Register your `AccountId32` using [`Pallet::map_account`] in order to
       * use it with this pallet.
       */
      AddressSuffix: StorageDescriptor<
        [Key: FixedSizeBinary<20>],
        FixedSizeBinary<12>,
        true,
        never
      >;
    };
  },
  {
    Revive: {
      call: TxDescriptor<{
        dest: FixedSizeBinary<20>;
        value: bigint;
        gas_limit: Gas;
        storage_deposit_limit: bigint;
        data: Binary;
      }>;
    };
  },
  {},
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
