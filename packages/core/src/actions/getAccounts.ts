import type { MaybeAsync } from "../types.js";
import { toObservable } from "../utils.js";
import type Wallet from "../wallets/wallet.js";
import type { ChainSpecData } from "@polkadot-api/substrate-client";
import { combineLatest } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export function getAccounts(
  wallets: MaybeAsync<Wallet[]>,
  chainSpec?: MaybeAsync<ChainSpecData>,
) {
  return combineLatest([toObservable(wallets), toObservable(chainSpec)]).pipe(
    switchMap(([wallets, chainSpec]) =>
      combineLatest(wallets.map((wallet) => wallet.accounts$)).pipe(
        map((wallets) => wallets.flat()),
        map(
          chainSpec === undefined
            ? (accounts) => accounts
            : (accounts) =>
                accounts.filter(
                  (account) =>
                    !account.genesisHash ||
                    chainSpec.genesisHash.includes(account.genesisHash),
                ),
        ),
      ),
    ),
  );
}
