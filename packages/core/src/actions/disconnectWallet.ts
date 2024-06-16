import type Wallet from "../wallets/wallet.js";

export const disconnectWallet = async (wallet: Wallet | Wallet[]) => {
  const walletsToDisconnect = Array.isArray(wallet) ? wallet : [wallet];

  await Promise.all(walletsToDisconnect.map((wallet) => wallet.disconnect()));
};
