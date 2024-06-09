import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider";
import type { ChainDefinition } from "polkadot-api";

type Gettable<T> = T | PromiseLike<T> | (() => T | PromiseLike<T>);

export interface Chains {}

export type ChainId = keyof Chains;

export type ReDotDescriptor = Chains[keyof Chains] extends never
  ? ChainDefinition
  : Chains[keyof Chains];

export type ChainConfig = {
  descriptor: ChainDefinition;
  provider: Gettable<JsonRpcProvider>;
};

export type Config = {
  chains: Record<ChainId, ChainConfig>;
};
