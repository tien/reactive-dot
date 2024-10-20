import type { Config } from "./config.js";
import type { ResolvedRegister } from "./register.js";
import type { ChainDefinition } from "polkadot-api";

type InferChains<T extends Config> = {
  [P in keyof T["chains"]]: T["chains"][P]["descriptor"];
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Chains extends InferChains<ResolvedRegister["config"]> {}

export type ChainId = keyof Chains;

export type CommonDescriptor = Chains[keyof Chains] extends never
  ? ChainDefinition
  : Chains[keyof Chains];

export type ChainDescriptorOf<T> = T extends ChainId
  ? Chains[T] extends ChainDefinition
    ? Chains[T]
    : CommonDescriptor
  : CommonDescriptor;
