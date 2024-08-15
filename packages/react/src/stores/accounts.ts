import { weakAtomFamily, withAtomFamilyErrorCatcher } from "../utils/jotai.js";
import { chainSpecDataAtomFamily } from "./client.js";
import { walletsAtom } from "./wallets.js";
import {
  getAccounts,
  type ChainId,
  type PolkadotAccount,
} from "@reactive-dot/core";
import type { Atom } from "jotai";
import { atomWithObservable } from "jotai/utils";

export const accountsAtom = weakAtomFamily(
  (chainId: ChainId): Atom<PolkadotAccount[] | Promise<PolkadotAccount[]>> =>
    withAtomFamilyErrorCatcher(
      accountsAtom,
      chainId,
      atomWithObservable,
    )((get) =>
      getAccounts(get(walletsAtom), get(chainSpecDataAtomFamily(chainId))),
    ),
);
