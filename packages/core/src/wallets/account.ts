import type { Wallet } from "./wallet.js";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";

export type PolkadotSignerAccount = {
  polkadotSigner: InjectedPolkadotAccount["polkadotSigner"];
  genesisHash?: InjectedPolkadotAccount["genesisHash"];
};

export type PolkadotAccount = PolkadotSignerAccount & {
  address: string;
};

export type WalletAccount = PolkadotAccount & {
  name?: string;
  wallet: Wallet;
};
