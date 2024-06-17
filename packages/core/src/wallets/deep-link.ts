import Wallet from "./wallet.js";

type ConnectionHandshake<T> = {
  uri: string;
  wait: () => Promise<T>;
};

export default abstract class DeepLinkWallet<
  THandshakeResponse,
> extends Wallet {
  abstract readonly initiateConnectionHandshake: () =>
    | ConnectionHandshake<THandshakeResponse>
    | Promise<ConnectionHandshake<THandshakeResponse>>;

  abstract readonly completeConnectionHandshake: (
    response: THandshakeResponse,
  ) => void | Promise<void>;
}
