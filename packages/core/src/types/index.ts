import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider";
import type { ChainDefinition } from "polkadot-api";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import type { Observable } from "rxjs";

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

export type Wallet = {
  readonly id: string;
  readonly name: string;
  readonly connected$: Observable<boolean>;
  readonly connect: () => void | Promise<void>;
  readonly disconnect: () => void | Promise<void>;
  readonly accounts$: Observable<InjectedPolkadotAccount[]>;
  readonly getAccounts: () =>
    | InjectedPolkadotAccount[]
    | Promise<InjectedPolkadotAccount[]>;
};

export type Connector = {
  readonly scan: () => Wallet[] | Promise<Wallet[]>;
  readonly wallets$: Observable<Wallet[]>;
  readonly getWallets: () => Wallet[] | Promise<Wallet[]>;
};

export type Config = {
  readonly chains: Record<ChainId, ChainConfig>;
  readonly wallets?: Array<Connector | Wallet>;
};
