import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider";
import type { ChainId } from "@reactive-dot/core";
import {
  createClient,
  type ChainDefinition,
  type PolkadotClient,
  type UnsafeApi,
} from "polkadot-api";
import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

export const ChainIdContext = createContext<ChainId | undefined>(undefined);

export const DANGEROUS_ClientContext = createContext<
  PolkadotClient | undefined
>(undefined);

export const DANGEROUS_ApiContext = createContext<
  UnsafeApi<ChainDefinition> | undefined
>(undefined);

export type ChainProviderProps = PropsWithChildren<
  | { chainId: ChainId }
  | {
      /**
       * For building dev tools only, NEVER use this in any other cases.
       */
      dangerous_provider: JsonRpcProvider;
    }
>;

/**
 * React context provider for scoping to a specific chain.
 *
 * @param props - Component props
 * @returns React element
 */
export function ChainProvider(props: ChainProviderProps) {
  if ("chainId" in props) {
    return (
      <ChainIdContext.Provider value={props.chainId}>
        {props.children}
      </ChainIdContext.Provider>
    );
  }

  return (
    <DANGEROUS_ChainProvider provider={props.dangerous_provider}>
      {props.children}
    </DANGEROUS_ChainProvider>
  );
}

type DANGEROUS_ChainProviderProps = PropsWithChildren<{
  provider: JsonRpcProvider;
}>;

function DANGEROUS_ChainProvider({
  provider,
  children,
}: DANGEROUS_ChainProviderProps) {
  const contextChainId = useContext(ChainIdContext);
  const chainId = useMemo(
    () => contextChainId ?? globalThis.crypto.randomUUID(),
    [contextChainId],
  );
  const client = useMemo(() => createClient(provider), [provider]);
  const api = useMemo(() => client.getUnsafeApi(), [client]);

  return (
    <ChainIdContext.Provider value={chainId}>
      <DANGEROUS_ClientContext.Provider value={client}>
        <DANGEROUS_ApiContext.Provider value={api}>
          {children}
        </DANGEROUS_ApiContext.Provider>
      </DANGEROUS_ClientContext.Provider>
    </ChainIdContext.Provider>
  );
}
