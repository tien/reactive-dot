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
  : ResolvedRegister["config"]["targetChains"] extends undefined
    ? Chains[keyof Chains]
    : Chains[NonNullable<ResolvedRegister["config"]["targetChains"]>[number]];

export type ChainDescriptorOf<T extends ChainId | undefined> =
  undefined extends T
    ? CommonDescriptor
    : T extends ChainId
      ? Chains[T]
      : never;
