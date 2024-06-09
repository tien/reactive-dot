import { chainIdAtom } from "./stores/client.js";
import { chainConfigsAtom } from "./stores/config.js";
import type { ChainId, Config } from "./types.js";
import { ScopeProvider } from "jotai-scope";
import { useHydrateAtoms } from "jotai/utils";
import { PropsWithChildren, useMemo } from "react";

export type ReDotProviderProps = PropsWithChildren<{ config: Config }>;

const ReDotHydrator = (props: ReDotProviderProps) => {
  useHydrateAtoms(
    useMemo(
      () => new Map([[chainConfigsAtom, props.config.chains]]),
      [props.config],
    ),
  );

  return null;
};

export const ReDotProvider = (props: ReDotProviderProps) => (
  <ScopeProvider atoms={[chainConfigsAtom]}>
    <ReDotHydrator {...props} />
    {props.children}
  </ScopeProvider>
);

export type ReDotChainProviderProps = PropsWithChildren<{
  chainId: ChainId;
}>;

const ReDotChainHydrator = (props: ReDotChainProviderProps) => {
  useHydrateAtoms(
    useMemo(() => new Map([[chainIdAtom, props.chainId]]), [props.chainId]),
  );

  return null;
};

export const ReDotChainProvider = (props: ReDotChainProviderProps) => (
  <ScopeProvider atoms={[chainIdAtom]}>
    <ReDotChainHydrator {...props} />
    {props.children}
  </ScopeProvider>
);
