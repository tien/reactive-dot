import Wallet from "./wallet.js";

type ConnectionHandshake = {
  uri: string;
  settled: Promise<void>;
};

export default abstract class DeepLinkWallet extends Wallet {
  abstract readonly initiateConnectionHandshake: () =>
    | ConnectionHandshake
    | Promise<ConnectionHandshake>;
}
