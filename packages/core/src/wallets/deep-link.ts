import { Wallet } from "./wallet.js";

type ConnectionHandshake = {
  uri: string;
  settled: Promise<void>;
};

export abstract class DeepLinkWallet extends Wallet {
  abstract initiateConnectionHandshake():
    | ConnectionHandshake
    | Promise<ConnectionHandshake>;
}
