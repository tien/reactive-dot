import { withAtomFamilyErrorCatcher } from "../utils/jotai.js";
import { chainSpecDataAtomFamily } from "./client.js";
import { walletsAtom } from "./wallets.js";
import {
  type Config,
  getAccounts,
  type ChainId,
  type PolkadotAccount,
} from "@reactive-dot/core";
import type { Atom } from "jotai";
import { atomFamily, atomWithObservable } from "jotai/utils";

export const accountsAtom = atomFamily(
  (param: {
    config: Config;
    chainId: ChainId | undefined;
  }): Atom<PolkadotAccount[] | Promise<PolkadotAccount[]>> =>
    withAtomFamilyErrorCatcher(
      accountsAtom,
      param,
      atomWithObservable,
    )((get) =>
      getAccounts(
        get(walletsAtom(param.config)),
        param.chainId === undefined
          ? undefined
          : // @ts-expect-error `chainId` will never be undefined
            get(chainSpecDataAtomFamily(param)),
      ),
    ),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
