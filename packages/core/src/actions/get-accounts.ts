import type { MaybeAsync } from "../types.js";
import { nativeTokenInfoFromChainSpecData } from "../utils/native-token-info-from-chain-spec-data.js";
import { toObservable } from "../utils/to-observable.js";
import type { WalletAccount } from "../wallets/account.js";
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

      const maybeSs58Format = chainSpec?.properties.ss58Format;

      const ss58Format =
        typeof maybeSs58Format === "number" ? maybeSs58Format : undefined;

      const ss58AccountId = AccountId(ss58Format);

      return combineLatest(
        wallets.map((wallet) =>
          wallet.accounts$.pipe(
            map((accounts) =>
              accounts
                .map((account): WalletAccount | undefined => {
                  const polkadotSigner = (() => {
                    if (typeof account.polkadotSigner !== "function") {
                      return account.polkadotSigner;
                    }

                    if (chainSpec === undefined) {
                      return undefined;
                    }

                    const nativeTokenInfo =
                      nativeTokenInfoFromChainSpecData(chainSpec);

                    return account.polkadotSigner({
                      tokenSymbol: nativeTokenInfo.code ?? "",
                      tokenDecimals: nativeTokenInfo.decimals ?? 0,
                    });
                  })();

                  if (polkadotSigner === undefined) {
                    return undefined;
                  }

                  return {
                    ...account,
                    polkadotSigner,
                    address: ss58AccountId.dec(polkadotSigner.publicKey),
                    wallet,
                  };
                })
                .filter((account) => account !== undefined),
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
