import type { MaybeAsync, PolkadotAccount } from "../types.js";
import { toObservable } from "../utils.js";
import type { Wallet } from "../wallets/wallet.js";
import type { ChainSpecData } from "@polkadot-api/substrate-client";
import { combineLatest, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export function getAccounts(
  wallets: MaybeAsync<Wallet[]>,
  chainSpec?: MaybeAsync<ChainSpecData>,
) {
  return combineLatest([toObservable(wallets), toObservable(chainSpec)]).pipe(
    switchMap(([wallets, chainSpec]) => {
      if (wallets.length === 0) {
        return of([]);
      }

      return combineLatest(
        wallets.map((wallet) =>
          wallet.accounts$.pipe(
            map((accounts) =>
              accounts.map(
                (account): PolkadotAccount => ({ ...account, wallet }),
              ),
            ),
          ),
        ),
      ).pipe(
        map((accounts) => accounts.flat()),
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
      );
    }),
  );
}
