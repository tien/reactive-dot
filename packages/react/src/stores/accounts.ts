import { withAtomFamilyErrorCatcher } from "../utils/jotai.js";
import { chainSpecDataAtomFamily } from "./client.js";
import { walletsAtom } from "./wallets.js";
import type { ChainId } from "@reactive-dot/core";
import type { Atom } from "jotai";
import { atomFamily, atomWithObservable } from "jotai/utils";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import { combineLatest, from } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export const accountsAtom = atomFamily(
  (
    chainId: ChainId,
  ): Atom<InjectedPolkadotAccount[] | Promise<InjectedPolkadotAccount[]>> =>
    withAtomFamilyErrorCatcher(
      accountsAtom,
      chainId,
      atomWithObservable,
    )((get) =>
      from(
        Promise.all([get(chainSpecDataAtomFamily(chainId)), get(walletsAtom)]),
      ).pipe(
        switchMap(([chainSpec, wallets]) =>
          combineLatest(wallets.map((wallet) => wallet.accounts$)).pipe(
            map((wallets) => wallets.flat()),
            map((accounts) =>
              accounts.filter(
                (account) =>
                  !account.genesisHash ||
                  chainSpec.genesisHash.includes(account.genesisHash),
              ),
            ),
          ),
        ),
      ),
    ),
);
