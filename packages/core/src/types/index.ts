import { WalletAggregator, Wallet } from "../wallets/index.js";
import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider";
import type { ChainDefinition } from "polkadot-api";

type Gettable<T> = T | PromiseLike<T> | (() => T | PromiseLike<T>);

export interface Chains {}

export type ChainId = keyof Chains;

export type ReDotDescriptor = Chains[keyof Chains] extends never
  ? ChainDefinition
  : Chains[keyof Chains];

export type ChainConfig = {
  readonly descriptor: ChainDefinition;
  readonly provider: Gettable<JsonRpcProvider>;
};

export type Config = {
  readonly chains: Record<ChainId, ChainConfig>;
  readonly wallets?: Array<WalletAggregator | Wallet>;
};
