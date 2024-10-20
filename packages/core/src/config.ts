import type { Gettable } from "./types.js";
import type { Wallet, WalletAggregator } from "./wallets/index.js";
import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider";
import type { ChainDefinition } from "polkadot-api";

export type ChainConfig = {
  readonly descriptor: ChainDefinition;
  readonly provider: Gettable<JsonRpcProvider>;
};

export type Config = {
  readonly chains: Record<string, ChainConfig>;
  readonly wallets?: Array<WalletAggregator | Wallet>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Register {}

type ResolvedRegister = {
  config: Register extends { config: infer config extends Config }
    ? config
    : Config;
};

type InferChains<T extends Config> = {
  [P in keyof T["chains"]]: T["chains"][P]["descriptor"];
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Chains extends InferChains<ResolvedRegister["config"]> {}

export type ChainId = keyof Chains;

export type CommonDescriptor = Chains[keyof Chains] extends never
  ? ChainDefinition
  : Chains[keyof Chains];
