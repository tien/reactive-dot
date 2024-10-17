import { Wallet, type WalletOptions } from "./wallet.js";

type ConnectionHandshake = {
  uri: string;
  settled: Promise<void>;
};

export abstract class DeepLinkWallet<
  TOptions extends WalletOptions = WalletOptions,
  TStorageKey extends string = string,
> extends Wallet<TOptions, TStorageKey> {
  abstract initiateConnectionHandshake():
    | ConnectionHandshake
    | Promise<ConnectionHandshake>;
}
