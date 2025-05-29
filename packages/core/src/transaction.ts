import type { Transaction, TxObservable } from "polkadot-api";

export type GenericTransaction = Transaction<
  NonNullable<unknown>,
  string,
  string,
  unknown
>;

export type TxOptionsOf<T extends GenericTransaction> = Parameters<
  TxObservable<
    T extends Transaction<infer _, infer __, infer ___, infer Asset>
      ? Asset
      : never
  >
>[1];
