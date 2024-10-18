import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import {
  aggregateWallets,
  type Config,
  getConnectedWallets,
} from "@reactive-dot/core";
import { Wallet, WalletAggregator } from "@reactive-dot/core/wallets.js";
import { atom } from "jotai";
import { atomWithObservable } from "jotai/utils";

const aggregatorWalletsAtom = atomFamilyWithErrorCatcher(
  (config: Config, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)(() =>
      aggregateWallets(
        config.wallets?.filter(
          (walletOrAggregator) =>
            walletOrAggregator instanceof WalletAggregator,
        ) ?? [],
      ),
    ),
);

export const walletsAtom = atomFamilyWithErrorCatcher(
  (config: Config, withErrorCatcher) =>
    withErrorCatcher(atom)(async (get) => [
      ...(config.wallets?.filter(
        (walletOrAggregator) => walletOrAggregator instanceof Wallet,
      ) ?? []),
      ...(await get(aggregatorWalletsAtom(config))),
    ]),
);

export const connectedWalletsAtom = atomFamilyWithErrorCatcher(
  (config: Config, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)((get) =>
      getConnectedWallets(get(walletsAtom(config))),
    ),
);
