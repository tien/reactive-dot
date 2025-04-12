import type { InjectedAccount } from "@mimirdev/apps-transports";
import { MimirPAPISigner } from "@mimirdev/papi-signer";
import { BaseError } from "@reactive-dot/core";
import {
  type PolkadotSignerAccount,
  Wallet,
  type WalletOptions,
} from "@reactive-dot/core/wallets.js";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

export type MimirWalletOptions = WalletOptions & { originName?: string };

export class MimirWallet extends Wallet<MimirWalletOptions, "connected"> {
  readonly id = "mimir";

  readonly name = "Mimir";

  readonly #mimir$ = new BehaviorSubject<MimirPAPISigner | undefined>(
    undefined,
  );

  readonly connected$ = this.#mimir$.pipe(map((mimir) => mimir !== undefined));

  readonly accounts$ = this.#mimir$.pipe(
    switchMap((mimir) => {
      if (mimir === undefined) {
        return of([]);
      }

      return new Observable<PolkadotSignerAccount[]>((subscriber) => {
        subscriber.add(
          mimir.subscribeAccounts((accounts) =>
            subscriber.next(this.#toPolkadotSignerAccount(mimir, accounts)),
          ),
        );
      });
    }),
  );

  constructor(options?: MimirWalletOptions) {
    super(options);
  }

  override async getAccounts() {
    const mimir = this.#mimir$.getValue();

    if (mimir === undefined) {
      throw new BaseError("Mimir is not connected");
    }

    return this.#toPolkadotSignerAccount(mimir, await mimir.getAccounts());
  }

  async initialize() {
    if (this.storage.getItem("connected") !== null) {
      await this.connect();
    }
  }

  async connect() {
    const signer = new MimirPAPISigner();

    const { result } = await signer.enable(
      this.options?.originName ?? globalThis.origin,
    );

    if (!result) {
      throw new BaseError("Failed to connect to Mimir");
    }

    this.#mimir$.next(signer);
    this.storage.setItem("connected", JSON.stringify(true));
  }

  disconnect() {
    this.#mimir$.next(undefined);
    this.storage.removeItem("connected");
  }

  #toPolkadotSignerAccount(
    mimir: MimirPAPISigner,
    accounts: InjectedAccount[],
  ) {
    return accounts.map(
      (account, index) =>
        ({
          id: index.toString(),
          polkadotSigner: mimir.getPolkadotSigner(account.address),
          ...account,
        }) satisfies PolkadotSignerAccount,
    );
  }
}
