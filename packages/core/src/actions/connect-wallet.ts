import type { Wallet } from "../wallets/wallet.js";

export async function connectWallet(wallet: Wallet | Wallet[]) {
  const walletsToConnect = Array.isArray(wallet) ? wallet : [wallet];

  await Promise.all(walletsToConnect.map((wallet) => wallet.connect()));
}
