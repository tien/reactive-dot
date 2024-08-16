import { configAtom } from "./config.js";
import { aggregateWallets, getConnectedWallets } from "@reactive-dot/core";
import { Wallet, WalletAggregator } from "@reactive-dot/core/wallets.js";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";

export const walletAggregatorsAtom = atom(
  (get) =>
    get(configAtom).wallets?.filter(
      (aggregator) => aggregator instanceof WalletAggregator,
    ) ?? [],
);

const aggregatorWallets = atomWithObservable((get) =>
  aggregateWallets(get(walletAggregatorsAtom)),
);

export const directWalletsAtom = atom<Wallet[]>(
  (get) =>
    get(configAtom).wallets?.filter((wallet) => wallet instanceof Wallet) ?? [],
);

export const walletsAtom = atom(async (get) => [
  ...get(directWalletsAtom),
  ...(await get(aggregatorWallets)),
]);

export const connectedWalletsAtom = atomWithObservable((get) =>
  getConnectedWallets(get(walletsAtom)),
);
