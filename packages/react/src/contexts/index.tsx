import { useWalletsInitializer } from "../hooks/use-wallets-initializer.js";
import { configAtom } from "../stores/config.js";
import { MutationEventSubjectContext } from "./mutation.js";
import type { Config } from "@reactive-dot/core";
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
   * Whether or not to initialize wallets on mount.
   */
  autoInitializeWallets?: boolean;
}>;

function ReDotHydrator(props: ReDotProviderProps) {
  useHydrateAtoms(useMemo(() => [[configAtom, props.config]], [props.config]));

  return null;
}

function WalletsInitializer() {
  const [_, initialize] = useWalletsInitializer();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}

/**
 * React context provider for Reactive DOT.
 *
 * @param props - Component props
 * @returns React element
 */
export function ReDotProvider({
  autoInitializeWallets = true,
  ...props
}: ReDotProviderProps) {
  return (
    <ScopeProvider atoms={[configAtom]}>
      <ReDotHydrator {...props} />
      {autoInitializeWallets && (
        <Suspense>
          <WalletsInitializer />
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
