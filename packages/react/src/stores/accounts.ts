import { withAtomFamilyErrorCatcher } from "../utils/jotai.js";
import { chainSpecDataAtomFamily } from "./client.js";
import { connectedWalletsAtom } from "./wallets.js";
import { getAccounts, type ChainId, type Config } from "@reactive-dot/core";
import type { WalletAccount } from "@reactive-dot/core/wallets.js";
import type { Atom } from "jotai";
import { atomFamily, atomWithObservable } from "jotai/utils";

export const accountsAtom = atomFamily(
  (param: {
    config: Config;
    chainId: ChainId | undefined;
  }): Atom<WalletAccount[] | Promise<WalletAccount[]>> =>
    withAtomFamilyErrorCatcher(
      accountsAtom,
      param,
      atomWithObservable,
    )((get) =>
      getAccounts(
        get(connectedWalletsAtom(param.config)),
        param.chainId === undefined
          ? undefined
          : // @ts-expect-error `chainId` will never be undefined
            get(chainSpecDataAtomFamily(param)),
      ),
    ),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
