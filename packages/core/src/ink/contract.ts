import { BaseError } from "../errors.js";
import type { GenericInkDescriptors } from "./types.js";

type ContractConfig<T extends GenericInkDescriptors = GenericInkDescriptors> = {
  descriptor: T;
};

const configs = new Map<string, ContractConfig>();

export class Contract<
  TDescriptor extends GenericInkDescriptors = GenericInkDescriptors,
> {
  readonly #id: string;

  constructor(id: string) {
    void (undefined as unknown as TDescriptor);
    this.#id = id;
  }

  valueOf() {
    return this.#id;
  }
}

export type DescriptorOfContract<TContract extends Contract> =
  TContract extends Contract<infer TDescriptor> ? TDescriptor : never;

/** @experimental */
export function defineContract<TDescriptor extends GenericInkDescriptors>(
  config: ContractConfig<TDescriptor>,
) {
  const id = globalThis.crypto.randomUUID();

  configs.set(id, config);

  return new Contract<TDescriptor>(id);
}

export function getContractConfig(contract: Contract) {
  const config = configs.get(contract.valueOf());

  if (config === undefined) {
    throw new BaseError(`Contract ${contract.valueOf()} not found`);
  }

  return config;
}
