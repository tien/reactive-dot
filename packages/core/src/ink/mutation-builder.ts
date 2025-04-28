import type { GenericTransaction } from "../transaction.js";
import type {
  ExtractExactProperties,
  MaybePromise,
  StringKeyOf,
} from "../types.js";
import type { Contract } from "./contract.js";
import type { GenericInkDescriptors, InkTxBody } from "./types.js";

export type InkMutationBuilder = <
  TDescriptor extends GenericInkDescriptors,
  TMessageName extends StringKeyOf<
    ExtractExactProperties<
      TDescriptor["__types"]["messages"],
      { mutates: true }
    >
  >,
>(
  contract: Contract<TDescriptor>,
  address: string,
  message: TMessageName,
  body: InkTxBody<TDescriptor, TMessageName>,
) => MaybePromise<GenericTransaction>;
