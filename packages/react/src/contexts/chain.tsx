import type { ChainId } from "@reactive-dot/core";
import { createContext, type PropsWithChildren } from "react";

export const ChainIdContext = createContext<ChainId | undefined>(undefined);

export type ChainProviderProps = PropsWithChildren<{
  chainId: ChainId;
}>;

/**
 * React context provider for scoping to a specific chain.
 *
 * @param props - Component props
 * @returns React element
 */
export function ChainProvider(props: ChainProviderProps) {
  return (
    // eslint-disable-next-line @eslint-react/no-context-provider
    <ChainIdContext.Provider value={props.chainId}>
      {props.children}
    </ChainIdContext.Provider>
  );
}
