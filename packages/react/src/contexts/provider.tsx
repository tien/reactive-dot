import { useWalletsInitializer } from "../hooks/use-wallets-initializer.js";
import { ConfigContext } from "./config.js";
import { MutationEventSubjectContext } from "./mutation.js";
import type { Config } from "@reactive-dot/core";
import { type PropsWithChildren, Suspense, useEffect, useMemo } from "react";
import { Subject } from "rxjs";

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
    <ConfigContext value={config}>
      <MutationEventSubjectContext value={useMemo(() => new Subject(), [])}>
        <Suspense>
          <WalletsInitializer />
        </Suspense>
        {children}
      </MutationEventSubjectContext>
    </ConfigContext>
  );
}

function WalletsInitializer() {
  const [_, initialize] = useWalletsInitializer();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
