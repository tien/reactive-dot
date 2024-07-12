import type { PolkadotSigner } from "polkadot-api";
import { createContext, type PropsWithChildren } from "react";

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
export function ReDotSignerProvider(props: ReDotSignerProviderProps) {
  return (
    <SignerContext.Provider value={props.signer}>
      {props.children}
    </SignerContext.Provider>
  );
}
