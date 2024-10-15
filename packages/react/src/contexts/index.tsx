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
}>;

/**
 * React context provider for ReactiveDOT.
 *
 * @param props - Component props
 * @returns React element
 */
export function ReactiveDotProvider({
  config,
  children,
}: ReactiveDotProviderProps) {
  return (
    <ConfigContext.Provider value={config}>
      <MutationEventSubjectContext.Provider
        value={useMemo(() => new Subject(), [])}
      >
        <Suspense>
          <WalletsInitializer />
        </Suspense>
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
