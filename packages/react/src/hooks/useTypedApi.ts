import { chainIdAtom, typedApiAtomFamily } from "../stores/client.js";
import type { Chains, ChainId, ReDotDescriptor } from "@reactive-dot/types";
import { useAtomValue } from "jotai";
import { TypedApi } from "polkadot-api";

export const useTypedApi = <TChainId extends ChainId | void = void>(options?: {
  chainId?: TChainId;
}): TypedApi<
  TChainId extends void ? ReDotDescriptor : Chains[Exclude<TChainId, void>]
> => {
  const defaultChainId = useAtomValue(chainIdAtom);
  const chainId = defaultChainId ?? options?.chainId;
  if (chainId === undefined) {
    throw new Error("No chain ID provided");
  }

  return useAtomValue(typedApiAtomFamily(chainId));
};
