import type { ChainId } from "./chains.js";
import type { Contract } from "./ink/contract.js";
import type { GenericTransaction } from "./transaction.js";

export type MutationEvent = {
  id: `${string}-${string}-${string}-${string}-${string}`;
  chainId: ChainId;
  call?: GenericTransaction["decodedCall"];
};

export type ContractMutationEvent = MutationEvent & {
  contractCalls: Array<{
    contract: Contract;
    address: string;
    message: string;
  }>;
};
