import { useReconnectWallets } from "../hooks/use-reconnect-wallets.js";
import { chainConfigsAtom } from "../stores/config.js";
import { aggregatorsAtom, directWalletsAtom } from "../stores/wallets.js";
import { MutationEventSubjectContext } from "./mutation.js";
import type { Config } from "@reactive-dot/core";
import { Wallet, WalletAggregator } from "@reactive-dot/core/wallets.js";
import { ScopeProvider } from "jotai-scope";
import { useHydrateAtoms } from "jotai/utils";
import { Suspense, useEffect, useMemo, type PropsWithChildren } from "react";
import { Subject } from "rxjs";

export {
  ChainIdContext,
  ReDotChainProvider,
  type ReDotChainProviderProps,
} from "./chain.js";

export {
  ReDotSignerProvider,
  SignerContext,
  type ReDotSignerProviderProps,
} from "./signer.js";

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

function ReDotHydrator(props: ReDotProviderProps) {
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
            aggregatorsAtom,
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
}

function WalletsReconnector() {
  const [_, reconnect] = useReconnectWallets();

  useEffect(() => {
    reconnect();
  }, [reconnect]);

  return null;
}

/**
 * React context provider for Reactive DOT.
 *
 * @param props - Component props
 * @returns React element
 */
export function ReDotProvider({
  autoReconnectWallets = true,
  ...props
}: ReDotProviderProps) {
  return (
    <ScopeProvider atoms={[chainConfigsAtom]}>
      <ReDotHydrator {...props} />
      {autoReconnectWallets && (
        <Suspense>
          <WalletsReconnector />
        </Suspense>
      )}
      <MutationEventSubjectContext.Provider
        value={useMemo(() => new Subject(), [])}
      >
        {props.children}
      </MutationEventSubjectContext.Provider>
    </ScopeProvider>
  );
}
