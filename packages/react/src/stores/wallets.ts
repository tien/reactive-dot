import {
  aggregateWallets,
  type Config,
  getConnectedWallets,
} from "@reactive-dot/core";
import { Wallet, WalletAggregator } from "@reactive-dot/core/wallets.js";
import { atom } from "jotai";
import { atomFamily, atomWithObservable } from "jotai/utils";

const aggregatorWallets = atomFamily((config: Config) =>
  atomWithObservable(() =>
    aggregateWallets(
      config.wallets?.filter(
        (walletOrAggregator) => walletOrAggregator instanceof WalletAggregator,
      ) ?? [],
    ),
  ),
);

export const walletsAtom = atomFamily((config: Config) =>
  atom(async (get) => [
    ...(config.wallets?.filter(
      (walletOrAggregator) => walletOrAggregator instanceof Wallet,
    ) ?? []),
    ...(await get(aggregatorWallets(config))),
  ]),
);

export const connectedWalletsAtom = atomFamily((config: Config) =>
  atomWithObservable((get) => getConnectedWallets(get(walletsAtom(config)))),
);
