import { chainIdAtom, typedApiAtomFamily } from "../stores/client.js";
import { Chain, ChainId, ReDotDescriptor } from "../types.js";
import { useAtomValue } from "jotai";
import { TypedApi } from "polkadot-api";

export const useTypedApi = <TChainId extends ChainId | void = void>(options?: {
  chainId?: TChainId;
}): TypedApi<
  TChainId extends void ? ReDotDescriptor : Chain[Exclude<TChainId, void>]
> => {
  const defaultChainId = useAtomValue(chainIdAtom);
  const chainId = defaultChainId ?? options?.chainId;

  if (chainId === undefined) {
    throw new Error("No chain ID provided");
  }

  return useAtomValue(typedApiAtomFamily(chainId));
};
