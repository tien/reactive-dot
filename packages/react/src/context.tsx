import { useReconnectWallets } from "./hooks/useReconnectWallets.js";
import { chainConfigsAtom } from "./stores/config.js";
import { aggregatorAtom, directWalletsAtom } from "./stores/wallets.js";
import type { ChainId, Config } from "@reactive-dot/core";
import { WalletAggregator, Wallet } from "@reactive-dot/core/wallets.js";
import { ScopeProvider } from "jotai-scope";
import { useHydrateAtoms } from "jotai/utils";
import { PolkadotSigner } from "polkadot-api";
import {
  PropsWithChildren,
  Suspense,
  createContext,
  useEffect,
  useMemo,
} from "react";

export type ReDotProviderProps = PropsWithChildren<{
  /**
   * Global config used by Reactive DOT.
   */
  config: Config;

  /**
   * Whether or not to reconnect previously connected wallets on mount.
   */
  autoReconnectWallets?: boolean;
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
            aggregatorAtom,
            props.config.wallets?.filter(
              (aggregator): aggregator is WalletAggregator =>
                aggregator instanceof WalletAggregator,
            ) ?? [],
          ],
        ]),
      [props.config],
    ),
  );

  return null;
};

const WalletsReconnector = () => {
  const [_, reconnect] = useReconnectWallets();

  useEffect(() => {
    reconnect();
  }, [reconnect]);

  return null;
};

/**
 * React context provider for Reactive DOT.
 *
 * @param props - Component props
 * @returns React element
 */
export const ReDotProvider = ({
  autoReconnectWallets = true,
  ...props
}: ReDotProviderProps) => (
  <ScopeProvider atoms={[chainConfigsAtom]}>
    <ReDotHydrator {...props} />
    {autoReconnectWallets && (
      <Suspense>
        <WalletsReconnector />
      </Suspense>
    )}
    {props.children}
  </ScopeProvider>
);

export const ChainIdContext = createContext<ChainId | undefined>(undefined);

export type ReDotChainProviderProps = PropsWithChildren<{
  chainId: ChainId;
}>;

/**
 * React context provider for scoping to a specific chain.
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
 * React context provider to assign a default signer.
 *
 * @param props - Component props
 * @returns React element
 */
export const ReDotSignerProvider = (props: ReDotSignerProviderProps) => (
  <SignerContext.Provider value={props.signer}>
    {props.children}
  </SignerContext.Provider>
);
