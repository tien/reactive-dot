import { Connector } from "./connectors/index.js";
import Wallet from "./wallet.js";

export const initializeWallets = async (
  walletsOrConnectors: Array<Wallet | Connector>,
) => {
  const wallets = (
    await Promise.all(
      walletsOrConnectors.map((walletOrConnector) =>
        walletOrConnector instanceof Connector
          ? walletOrConnector.getWallets()
          : [walletOrConnector],
      ),
    )
  ).flat();

  return Promise.all(wallets.map((wallet) => wallet.initialize()));
};
