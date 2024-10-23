import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers";
import {
  type PolkadotSignerAccount,
  Wallet,
  type WalletOptions,
} from "@reactive-dot/core/wallets.js";
import { getPolkadotSigner } from "polkadot-api/signer";
import { BehaviorSubject } from "rxjs";

type DevelopmentWalletOptions = WalletOptions & {
  accounts?: ReadonlyArray<{ mnemonic: string; path: string; name?: string }>;
  includesWellknownDevAccounts?: boolean;
};

export class DevelopmentWallet extends Wallet<DevelopmentWalletOptions> {
  id = "development";

  name = "Development";

  initialize() {
    const accounts = [
      ...(this.options?.accounts ?? []),
      ...(!this.options?.includesWellknownDevAccounts
        ? []
        : [
            "Alice",
            "Bob",
            "Charlie",
            "Dave",
            "Eve",
            "Ferdie",
            "AliceStash",
            "BobStash",
            "CharlieStash",
            "DaveStash",
            "EveStash",
            "FerdieStash",
          ].map((name) => ({ mnemonic: DEV_PHRASE, path: `//${name}`, name }))),
    ];

    this.accounts$.next(
      accounts.map(({ mnemonic, path, name }) => {
        const entropy = mnemonicToEntropy(mnemonic);
        const miniSecret = entropyToMiniSecret(entropy);
        const derive = sr25519CreateDerive(miniSecret);
        const hdkdKeyPair = derive(path);

        const polkadotSigner = getPolkadotSigner(
          hdkdKeyPair.publicKey,
          "Sr25519",
          hdkdKeyPair.sign,
        );

        return {
          id: globalThis.crypto.randomUUID(),
          polkadotSigner,
          ...(name === undefined ? undefined : { name }),
        };
      }),
    );
  }

  connected$ = new BehaviorSubject(true);

  connect() {
    this.connected$.next(true);
  }

  disconnect() {
    this.connected$.next(false);
  }

  accounts$ = new BehaviorSubject<PolkadotSignerAccount[]>([]);

  getAccounts() {
    return this.accounts$.value;
  }
}
