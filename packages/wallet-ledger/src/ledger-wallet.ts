import type { WalletOptions } from "../../core/build/wallets/wallet.js";
import { AccountMismatchError } from "./errors.js";
import type { LedgerSigner } from "@polkadot-api/ledger-signer";
import { Binary } from "@polkadot-api/substrate-bindings";
import {
  type LocalWallet,
  type PolkadotSignerAccount,
  Wallet,
} from "@reactive-dot/core/wallets.js";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { map, skip } from "rxjs/operators";

type LedgerAccount = {
  publicKey: Uint8Array;
  name?: string;
  path: number;
};

type JsonLedgerAccount = Omit<LedgerAccount, "publicKey"> & {
  publicKey: string;
};

/**
 * @experimental
 */
export class LedgerWallet extends Wallet<"accounts"> implements LocalWallet {
  override readonly id = "ledger";

  override readonly name = "Ledger";

  readonly #ledgerAccounts$ = new BehaviorSubject<LedgerAccount[]>([]);

  override readonly accounts$ = this.#ledgerAccounts$.pipe(
    map((accounts) =>
      accounts.map(
        (account): PolkadotSignerAccount => ({
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

  override readonly connected$ = this.accounts$.pipe(
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
            (account): JsonLedgerAccount => ({
              ...account,
              publicKey: Binary.fromBytes(account.publicKey).asHex(),
            }),
          ),
        ),
      ),
    );
  }

  override initialize() {
    this.#ledgerAccounts$.next(
      (
        JSON.parse(
          this.storage.getItem("accounts") ?? JSON.stringify([]),
        ) as JsonLedgerAccount[]
      ).map((account) => ({
        ...account,
        publicKey: Binary.fromHex(account.publicKey).asBytes(),
      })),
    );
  }

  override connect() {}

  override disconnect() {
    this.clearAccounts();
  }

  override getAccounts() {
    return lastValueFrom(this.accounts$);
  }

  addAccount(account: LedgerAccount) {
    this.#ledgerAccounts$.next(
      this.#ledgerAccounts$.value
        .filter(
          (storedAccount) => storedAccount.publicKey !== account.publicKey,
        )
        .concat([account]),
    );
  }

  removeAccount(account: LedgerAccount) {
    this.#ledgerAccounts$.next(
      this.#ledgerAccounts$.value.filter(
        (storedAccount) => storedAccount.publicKey !== account.publicKey,
      ),
    );
  }

  clearAccounts() {
    this.#ledgerAccounts$.next([]);
  }

  async getConnectedAccount(path: number) {
    const ledgerSigner = await this.#getOrCreateLedgerSigner();
    const publicKey = await ledgerSigner.getPubkey(path);

    return {
      publicKey,
      path,
    } as LedgerAccount;
  }

  async #assertMatchingAccount(account: LedgerAccount) {
    const ledgerSigner = await this.#getOrCreateLedgerSigner();
    const publicKey = await ledgerSigner.getPubkey(account.path);

    if (account.publicKey !== publicKey) {
      throw new AccountMismatchError();
    }
  }

  async #getOrCreateLedgerSigner() {
    if (this.#ledgerSigner !== undefined) {
      return this.#ledgerSigner;
    }

    if (!("Buffer" in globalThis)) {
      const { Buffer } = await import("buffer/");

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
