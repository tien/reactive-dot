import type { Wallet } from "../wallets/wallet.js";

export async function disconnectWallet(wallet: Wallet | Wallet[]) {
  const walletsToDisconnect = Array.isArray(wallet) ? wallet : [wallet];

  await Promise.all(walletsToDisconnect.map((wallet) => wallet.disconnect()));
}
