import { chainConfigsAtom } from "./stores/config.js";
import { connectorsAtom, directWalletsAtom } from "./stores/wallets.js";
import { Connector, Wallet } from "@reactive-dot/core/wallets.js";
import type { ChainId, Config } from "@reactive-dot/types";
import { ScopeProvider } from "jotai-scope";
import { useHydrateAtoms } from "jotai/utils";
import { PolkadotSigner } from "polkadot-api";
import { PropsWithChildren, createContext, useMemo } from "react";

export type ReDotProviderProps = PropsWithChildren<{
  /**
   * Global config used by Reactive DOT
   */
  config: Config;
}>;

const ReDotHydrator = (props: ReDotProviderProps) => {
  useHydrateAtoms(
    useMemo(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Map<any, any>([
          [chainConfigsAtom, props.config.chains],
          [
            directWalletsAtom,
            props.config.wallets?.filter(
              (wallet): wallet is Wallet => wallet instanceof Wallet,
            ) ?? [],
          ],
          [
            connectorsAtom,
            props.config.wallets?.filter(
              (connector): connector is Connector =>
                connector instanceof Connector,
            ) ?? [],
          ],
        ]),
      [props.config],
    ),
  );

  return null;
};

/**
 * React context provider for Reactive DOT
 *
 * @param props - Component props
 * @returns React element
 */
export const ReDotProvider = (props: ReDotProviderProps) => (
  <ScopeProvider atoms={[chainConfigsAtom]}>
    <ReDotHydrator {...props} />
    {props.children}
  </ScopeProvider>
);

export const ChainIdContext = createContext<ChainId | undefined>(undefined);

export type ReDotChainProviderProps = PropsWithChildren<{
  chainId: ChainId;
}>;

/**
 * React context provider for scoping to a specific chain
 *
 * @param props - Component props
 * @returns React element
 */
export const ReDotChainProvider = (props: ReDotChainProviderProps) => (
  <ChainIdContext.Provider value={props.chainId}>
    {props.children}
  </ChainIdContext.Provider>
);

export const SignerContext = createContext<PolkadotSigner | undefined>(
  undefined,
);

export type ReDotSignerProviderProps = PropsWithChildren<{
  /**
   * The default signer
   */
  signer: PolkadotSigner | undefined;
}>;

/**
 * React context provider to assign a default signer
 *
 * @param props - Component props
 * @returns React element
 */
export const ReDotSignerProvider = (props: ReDotSignerProviderProps) => (
  <SignerContext.Provider value={props.signer}>
    {props.children}
  </SignerContext.Provider>
);
