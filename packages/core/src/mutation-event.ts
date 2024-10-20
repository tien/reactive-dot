import type { ChainId } from "./chains.js";
import type { Transaction } from "polkadot-api";

export type MutationEvent = {
  id: `${string}-${string}-${string}-${string}-${string}`;
  chainId: ChainId;
  call?: Transaction<
    NonNullable<unknown>,
    string,
    string,
    unknown
  >["decodedCall"];
};
