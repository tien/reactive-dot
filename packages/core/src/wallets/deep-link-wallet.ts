import { Wallet } from "./wallet.js";

type ConnectionHandshake = {
  uri: string;
  settled: Promise<void>;
};

export abstract class DeepLinkWallet<
  TStorageKey extends string = string,
> extends Wallet<TStorageKey> {
  abstract initiateConnectionHandshake():
    | ConnectionHandshake
    | Promise<ConnectionHandshake>;
}
