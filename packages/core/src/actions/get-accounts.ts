import type { MaybeAsync, PolkadotAccount } from "../types.js";
import { toObservable } from "../utils.js";
import type { Wallet } from "../wallets/wallet.js";
import type { ChainSpecData } from "@polkadot-api/substrate-client";
import { AccountId } from "polkadot-api";
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

      const maybeSs58Format = chainSpec?.properties["ss58Format"];

      const ss58Format =
        typeof maybeSs58Format === "number" ? maybeSs58Format : undefined;

      const ss58AccountId =
        ss58Format === undefined ? undefined : AccountId(ss58Format);

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
                accounts
                  .filter(
                    (account) =>
                      !account.genesisHash ||
                      chainSpec.genesisHash.includes(account.genesisHash),
                  )
                  .map((account) =>
                    ss58AccountId === undefined
                      ? account
                      : {
                          ...account,
                          address: ss58AccountId.dec(
                            ss58AccountId.enc(account.address),
                          ),
                        },
                  ),
        ),
      );
    }),
  );
}
