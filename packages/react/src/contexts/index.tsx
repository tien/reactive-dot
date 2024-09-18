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
  ChainProvider,
  type ChainProviderProps,
} from "./chain.js";

export {
  SignerProvider,
  SignerContext,
  type SignerProviderProps,
} from "./signer.js";

export const ConfigContext = createContext<Config | undefined>(undefined);

export type ReactiveDotProviderProps = PropsWithChildren<{
  /**
   * Global config used by ReactiveDOT.
   */
  config: Config;

  /**
   * Whether or not to initialize wallets on mount.
   */
  autoInitializeWallets?: boolean;
}>;

/**
 * React context provider for ReactiveDOT.
 *
 * @param props - Component props
 * @returns React element
 */
export function ReactiveDotProvider({
  config,
  autoInitializeWallets = true,
  children,
}: ReactiveDotProviderProps) {
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
