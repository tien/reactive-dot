import type { WalletOptions } from "../../core/build/wallets/wallet.js";
import { AccountMismatchError } from "./errors.js";
import { AccountId } from "@polkadot-api/substrate-bindings";
import { Wallet, type LocalWallet } from "@reactive-dot/core/wallets.js";
import type { PolkadotGenericApp } from "@zondax/ledger-substrate";
import type { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { map, skip } from "rxjs/operators";

const getPublicKey = AccountId().enc;

type LedgerAccount = {
  address: string;
  name?: string;
  path: string;
};

/**
 * @experimental
 */
export class LedgerWallet extends Wallet<"accounts"> implements LocalWallet {
  override readonly id = "ledger";

  override readonly name = "Ledger";

  readonly #ledgerAccounts$ = new BehaviorSubject<LedgerAccount[]>([]);

  // TODO: complete this logic
  override readonly accounts$ = this.#ledgerAccounts$.pipe(
    map((accounts): InjectedPolkadotAccount[] =>
      accounts.map((account) => ({
        address: account.address,
        type: "ed25519",
        ...(account.name === undefined ? {} : { name: account.name }),
        polkadotSigner: {
          publicKey: getPublicKey(account.address),
          signTx: async (
            callData,
            _signedExtensions,
            metadata,
            _atBlockNumber,
            _hasher,
          ) => {
            await this.#assertMatchingAccount(account);

            const app = await this.#getOrCreateApp();
            const response = await app.signWithMetadata(
              account.path,
              Buffer.from(callData),
              Buffer.from(metadata),
            );

            return response.signature;
          },
          signBytes: async (data) => {
            await this.#assertMatchingAccount(account);

            const app = await this.#getOrCreateApp();
            const response = await app.signRaw(account.path, Buffer.from(data));

            return response.signature;
          },
        },
      })),
    ),
  );

  override readonly connected$ = this.accounts$.pipe(
    map((accounts) => accounts.length > 0),
  );

  #app?: PolkadotGenericApp;

  constructor(options?: WalletOptions) {
    super(options);
    this.#ledgerAccounts$
      .pipe(skip(1))
      .subscribe((accounts) =>
        this.storage.setItem("accounts", JSON.stringify(accounts)),
      );
  }

  override initialize() {
    this.#ledgerAccounts$.next(
      JSON.parse(
        this.storage.getItem("accounts") ?? JSON.stringify([]),
      ) as LedgerAccount[],
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
        .filter((storedAccount) => storedAccount.address !== account.address)
        .concat([account]),
    );
  }

  removeAccount(account: LedgerAccount) {
    this.#ledgerAccounts$.next(
      this.#ledgerAccounts$.value.filter(
        (storedAccount) => storedAccount.address !== account.address,
      ),
    );
  }

  clearAccounts() {
    this.#ledgerAccounts$.next([]);
  }

  async getConnectedAccount(index = 0) {
    const app = await this.#getOrCreateApp();
    const path = this.#getBip44Path(index);
    const { address } = await app.getAddress(path, 42, false);

    return { address, path } as LedgerAccount;
  }

  async #assertMatchingAccount(account: LedgerAccount) {
    const app = await this.#getOrCreateApp();
    const ledgerAccount = await app.getAddress(account.path, 42, false);

    if (account.address !== ledgerAccount.address) {
      throw new AccountMismatchError();
    }
  }

  #getBip44Path(account: number) {
    return `m/44'/354'/${account}'/0/0`;
  }

  async #getOrCreateApp() {
    if (this.#app !== undefined) {
      return this.#app;
    }

    if (!("Buffer" in globalThis)) {
      const { Buffer } = await import("buffer/");

      // @ts-expect-error polyfill types mismatch
      globalThis.Buffer = Buffer;
    }

    const [{ default: TransportWebUSB }, { PolkadotGenericApp }] =
      await Promise.all([
        import("@ledgerhq/hw-transport-webusb"),
        import("@zondax/ledger-substrate"),
      ]);

    // @ts-expect-error Weird bug with Zondax
    return (this.#app = new PolkadotGenericApp(await TransportWebUSB.create()));
  }
}
