import { aggregateWallets, getConnectedWallets } from "@reactive-dot/core";
import type { Wallet, WalletAggregator } from "@reactive-dot/core/wallets.js";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";

export const aggregatorsAtom = atom<WalletAggregator[]>([]);

const aggregatorWallets = atomWithObservable((get) =>
  aggregateWallets(get(aggregatorsAtom)),
);

export const directWalletsAtom = atom<Wallet[]>([]);

export const walletsAtom = atom(async (get) => [
  ...get(directWalletsAtom),
  ...(await get(aggregatorWallets)),
]);

export const connectedWalletsAtom = atomWithObservable((get) =>
  getConnectedWallets(get(walletsAtom)),
);
