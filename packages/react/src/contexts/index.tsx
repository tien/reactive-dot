import { useWalletsInitializer } from "../hooks/use-wallets-initializer.js";
import { MutationEventSubjectContext } from "./mutation.js";
import type { Config } from "@reactive-dot/core";
import {
  createContext,
  Suspense,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from "react";
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

export const ConfigContext = createContext<Config | undefined>(undefined);

export type ReDotProviderProps = PropsWithChildren<{
  /**
   * Global config used by Reactive DOT.
   */
  config: Config;

  /**
   * Whether or not to initialize wallets on mount.
   */
  autoInitializeWallets?: boolean;
}>;

/**
 * React context provider for Reactive DOT.
 *
 * @param props - Component props
 * @returns React element
 */
export function ReDotProvider({
  config,
  autoInitializeWallets = true,
  children,
}: ReDotProviderProps) {
  return (
    <ConfigContext.Provider value={config}>
      <MutationEventSubjectContext.Provider
        value={useMemo(() => new Subject(), [])}
      >
        {autoInitializeWallets && (
          <Suspense>
            <WalletsInitializer />
          </Suspense>
        )}
        {children}
      </MutationEventSubjectContext.Provider>
    </ConfigContext.Provider>
  );
}

function WalletsInitializer() {
  const [_, initialize] = useWalletsInitializer();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
