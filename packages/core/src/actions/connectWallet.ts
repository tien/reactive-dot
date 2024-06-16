import type Wallet from "../wallets/wallet.js";

export const connectWallet = async (wallet: Wallet | Wallet[]) => {
  const walletsToConnect = Array.isArray(wallet) ? wallet : [wallet];

  await Promise.all(walletsToConnect.map((wallet) => wallet.connect()));
};
