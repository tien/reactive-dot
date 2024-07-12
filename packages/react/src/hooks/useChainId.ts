import { ChainIdContext } from "../contexts/index.js";
import type { ChainHookOptions } from "./types.js";
import { ReDotError } from "@reactive-dot/core";
import { useContext } from "react";

export default function useChainId(options?: ChainHookOptions) {
  const contextChainId = useContext(ChainIdContext);
  const chainId = options?.chainId ?? contextChainId;

  if (chainId === undefined) {
    throw new ReDotError("No chain Id provided");
  }

  return chainId;
}
