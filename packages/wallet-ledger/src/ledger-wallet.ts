import type { WalletOptions } from "../../core/build/wallets/wallet.js";
import { AccountMismatchError } from "./errors.js";
import type { LedgerSigner } from "@polkadot-api/ledger-signer";
import { Binary } from "@polkadot-api/substrate-bindings";
import {
  LocalWallet,
  type PolkadotSignerAccount,
} from "@reactive-dot/core/wallets.js";
import { BehaviorSubject } from "rxjs";
import { map, skip } from "rxjs/operators";

type LedgerAccount = {
  id: string;
  publicKey: Uint8Array;
  name?: string;
  path: number;
};

type JsonLedgerAccount = Omit<LedgerAccount, "publicKey" | "id"> & {
  publicKey: string;
};

export class LedgerWallet extends LocalWallet<
  LedgerAccount,
  WalletOptions,
  "accounts"
> {
  readonly id = "ledger";

  readonly name = "Ledger";

  readonly #ledgerAccounts$ = new BehaviorSubject<LedgerAccount[]>([]);

  readonly accounts$ = this.#ledgerAccounts$.pipe(
    map((accounts) =>
      accounts
        .toSorted((a, b) => a.path - b.path)
        .map(
          (account): PolkadotSignerAccount => ({
            id: account.id,
            ...(account.name === undefined ? {} : { name: account.name }),
            polkadotSigner: ({ tokenSymbol, tokenDecimals }) => ({
              publicKey: account.publicKey,
              signTx: async (...args) => {
                await this.#assertMatchingAccount(account);

                const ledgerSigner = await this.#getOrCreateLedgerSigner();
                const polkadotSigner = await ledgerSigner.getPolkadotSigner(
                  { tokenSymbol, decimals: tokenDecimals },
                  account.path,
                );

                return polkadotSigner.signTx(...args);
              },
              signBytes: async (...args) => {
                await this.#assertMatchingAccount(account);

                const ledgerSigner = await this.#getOrCreateLedgerSigner();
                const polkadotSigner = await ledgerSigner.getPolkadotSigner(
                  { tokenSymbol, decimals: tokenDecimals },
                  account.path,
                );

                return polkadotSigner.signBytes(...args);
              },
            }),
          }),
        ),
    ),
  );

  readonly connected$ = this.accounts$.pipe(
    map((accounts) => accounts.length > 0),
  );

  #ledgerSigner?: LedgerSigner;

  constructor(options?: WalletOptions) {
    super(options);
    this.#ledgerAccounts$.pipe(skip(1)).subscribe((accounts) =>
      this.storage.setItem(
        "accounts",
        JSON.stringify(
          accounts.map(
            ({ id, ...account }): JsonLedgerAccount => ({
              ...account,
              publicKey: Binary.fromBytes(account.publicKey).asHex(),
            }),
          ),
        ),
      ),
    );
  }

  initialize() {
    this.#ledgerAccounts$.next(
      (
        JSON.parse(
          this.storage.getItem("accounts") ?? JSON.stringify([]),
        ) as JsonLedgerAccount[]
      ).map((account) => ({
        ...account,
        id: account.publicKey,
        publicKey: Binary.fromHex(account.publicKey).asBytes(),
      })),
    );
  }

  async connect() {
    this.accountStore.add(await this.getConnectedAccount());
  }

  disconnect() {
    this.accountStore.clear();
  }

  accountStore = {
    add: (account: LedgerAccount) => {
      this.#ledgerAccounts$.next(
        this.#ledgerAccounts$.value
          .filter((storedAccount) => storedAccount.id !== account.id)
          .concat([account]),
      );
    },
    clear: () => {
      this.#ledgerAccounts$.next([]);
    },
    delete: (identifiable: string | { id: string }) => {
      const id =
        typeof identifiable === "string" ? identifiable : identifiable.id;

      this.#ledgerAccounts$.next(
        this.#ledgerAccounts$.value.filter(
          (storedAccount) => storedAccount.id !== id,
        ),
      );
    },
    has: (identifiable: string | { id: string }) => {
      const id =
        typeof identifiable === "string" ? identifiable : identifiable.id;

      return this.#ledgerAccounts$.value.some((account) => account.id === id);
    },
    values: () => this.#ledgerAccounts$.value,
  };

  /**
   * @experimental
   * @param path - The primary derivation index
   * @returns The connected Ledger's account
   */
  async getConnectedAccount(path = 0) {
    const ledgerSigner = await this.#getOrCreateLedgerSigner();
    const publicKey = await ledgerSigner.getPubkey(path);

    return {
      id: Binary.fromBytes(publicKey).asHex(),
      publicKey,
      path,
    } as LedgerAccount;
  }

  async #assertMatchingAccount(account: LedgerAccount) {
    const ledgerSigner = await this.#getOrCreateLedgerSigner();
    const publicKey = await ledgerSigner.getPubkey(account.path);

    if (
      Binary.fromBytes(account.publicKey).asHex() !==
      Binary.fromBytes(publicKey).asHex()
    ) {
      throw new AccountMismatchError();
    }
  }

  async #getOrCreateLedgerSigner() {
    if (this.#ledgerSigner !== undefined) {
      return this.#ledgerSigner;
    }

    if (!("Buffer" in globalThis)) {
      const {
        default: { Buffer },
      } = await import("buffer/");

      // @ts-expect-error polyfill types mismatch
      globalThis.Buffer = Buffer;
    }

    const [{ default: TransportWebUSB }, { LedgerSigner }] = await Promise.all([
      import("@ledgerhq/hw-transport-webusb"),
      import("@polkadot-api/ledger-signer"),
    ]);

    return (this.#ledgerSigner = new LedgerSigner(
      // @ts-expect-error Weird bug with Ledger
      await TransportWebUSB.create(),
    ));
  }
}
