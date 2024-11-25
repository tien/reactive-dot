import type { LightClientProvider } from "./providers/light-client/provider.js";
import type { Gettable } from "./types.js";
import type { Wallet, WalletProvider } from "./wallets/index.js";
import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider";
import type { ChainDefinition } from "polkadot-api";

export type ChainConfig = {
  readonly descriptor: ChainDefinition;
  readonly provider: Gettable<JsonRpcProvider | LightClientProvider>;
};

export type Config<
  TChains extends Readonly<Record<string, ChainConfig>> = Readonly<
    Record<string, ChainConfig>
  >,
  TTargetChainIds extends ReadonlyArray<
    Extract<keyof TChains, string>
  > = ReadonlyArray<Extract<keyof TChains, string>>,
> = {
  readonly chains: TChains;
  readonly targetChains?: TTargetChainIds;
  readonly wallets?: ReadonlyArray<WalletProvider | Wallet>;
};

export function defineConfig<
  const TChains extends Readonly<Record<string, ChainConfig>>,
  const TTargetChainIds extends ReadonlyArray<Extract<keyof TChains, string>>,
>(config: Config<TChains, TTargetChainIds>) {
  return config;
}
