import type { Transaction, TxObservable } from "polkadot-api";

export type GenericTransaction = Transaction<
  Record<string, unknown>,
  string,
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

export type TxOptionsOf<T extends GenericTransaction> = Parameters<
  TxObservable<
    T extends Transaction<infer _, infer __, infer ___, infer Asset>
      ? Asset
      : never
  >
>[1];
