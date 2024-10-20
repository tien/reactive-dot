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

export function defineConfig<const TConfig extends Config>(config: TConfig) {
  return config;
}
