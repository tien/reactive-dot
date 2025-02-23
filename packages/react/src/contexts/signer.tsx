import type { PolkadotSigner } from "polkadot-api";
import { createContext, type PropsWithChildren } from "react";

export const SignerContext = createContext<PolkadotSigner | undefined>(
  undefined,
);

export type SignerProviderProps = PropsWithChildren<{
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
export function SignerProvider(props: SignerProviderProps) {
  return <SignerContext value={props.signer}>{props.children}</SignerContext>;
}
