import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider";
import type { ChainDefinition } from "polkadot-api";

// TODO: dirty hack to prevent type alias from getting flattened
const preserve = Symbol();

export type Chain = {
  [id: string]: ChainDefinition;
};

export type ChainId = keyof Chain;

export type ReDotDescriptor = Chain[keyof Chain] & { [preserve]?: true };

export type ChainConfig = {
  descriptor: ChainDefinition;
  provider: Gettable<JsonRpcProvider>;
};

export type Config = {
  chains: Record<ChainId, ChainConfig>;
};

export type Gettable<T> = T | PromiseLike<T> | (() => T | PromiseLike<T>);

export type Falsy = undefined | null | false;

export type FalsyGuard<
  TType,
  TReturnType,
  TFalsyValues = Falsy,
> = TType extends TFalsyValues ? TReturnType | undefined : TReturnType;

export type FlatHead<TArray extends unknown[]> = TArray extends [infer Head]
  ? Head
  : TArray;
