import { ReDotError } from "../../errors.js";
import Wallet from "../wallet.js";
import { getPolkadotSignerFromPjs } from "./from-pjs-account.js";
import "@polkadot-api/pjs-signer";
import { AccountId } from "@polkadot-api/substrate-bindings";
import {
  WalletConnectModal,
  type WalletConnectModalConfig,
} from "@walletconnect/modal";
import type { SessionTypes, ISignClient } from "@walletconnect/types";
import {
  UniversalProvider,
  type IUniversalProvider,
  type UniversalProviderOpts,
} from "@walletconnect/universal-provider";
import { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { map } from "rxjs/operators";

export default class WalletConnect extends Wallet {
  readonly #providerOptions: UniversalProviderOpts;

  #provider: IUniversalProvider | undefined;

  readonly #modal: WalletConnectModal;

  readonly #chainIds: string[];

  readonly #optionalChainIds: string[];

  readonly #session = new BehaviorSubject<SessionTypes.Struct | undefined>(
    undefined,
  );

  override readonly id = "wallet-connect";

  override readonly name = "WalletConnect";

  constructor(options: {
    projectId?: string;
    providerOptions: Omit<UniversalProviderOpts, "projectId">;
    modalOptions?: Omit<WalletConnectModalConfig, "projectId">;
    chainIds: string[];
    optionalChainIds?: string[];
  }) {
    super();

    this.#providerOptions =
      options.projectId === undefined
        ? options.providerOptions
        : { ...options.providerOptions, projectId: options.projectId };

    this.#modal = new WalletConnectModal({
      ...(options.modalOptions ?? {}),
      projectId: options.projectId,
    });

    this.#chainIds = options.chainIds;
    this.#optionalChainIds = options.optionalChainIds ?? [];
  }

  override readonly initialize = async () => {
    this.#provider ??= await UniversalProvider.init(this.#providerOptions);

    if (this.#provider.session !== undefined) {
      return this.#session.next(this.#provider.session);
    }
  };

  override readonly connected$ = this.#session.pipe(
    map((session) => session !== undefined),
  );

  override readonly connect = async () => {
    this.initialize();

    if (this.#provider?.client === undefined) {
      throw new ReDotError("Wallet connect provider doesn't have any client");
    }

    const connectOptions: Parameters<ISignClient["connect"]>[0] = {
      requiredNamespaces: {
        polkadot: {
          methods: ["polkadot_signTransaction", "polkadot_signMessage"],
          chains: this.#chainIds,
          events: ['chainChanged", "accountsChanged'],
        },
      },
    };

    if (this.#optionalChainIds.length > 0) {
      connectOptions.optionalNamespaces = {
        polkadot: {
          methods: ["polkadot_signTransaction", "polkadot_signMessage"],
          chains: this.#optionalChainIds,
          events: ['chainChanged", "accountsChanged'],
        },
      };
    }

    const { uri, approval } =
      await this.#provider.client.connect(connectOptions);

    if (uri === undefined) {
      throw new ReDotError("Client connection doesn't return any URI");
    }

    await this.#modal.openModal({ uri });

    this.#session.next(await approval());

    this.#modal.closeModal();
  };

  override readonly disconnect = async () => {
    await this.#provider?.disconnect();
    this.#session.next(undefined);
  };

  override readonly accounts$ = this.#session.pipe(
    map((session) => {
      if (session === undefined) {
        return [];
      }

      return Object.values(session.namespaces)
        .flatMap((namespace) => namespace.accounts)
        .map(
          (account) =>
            account.split(":") as [
              chainType: string,
              chainId: string,
              address: string,
            ],
        )
        .map(
          ([chainType, chainId, address]): InjectedPolkadotAccount => ({
            address,
            genesisHash: chainId,
            polkadotSigner: getPolkadotSignerFromPjs(
              AccountId().enc(address),
              (payload) =>
                this.#provider!.client!.request<{
                  signature: `0x${string}`;
                }>({
                  chainId: `${chainType}:${chainId}`,
                  topic: session.topic,
                  request: {
                    method: "polkadot_signTransaction",
                    params: {
                      address,
                      transactionPayload: payload,
                    },
                  },
                }),
            ),
          }),
        );
    }),
  );

  override readonly getAccounts = () => lastValueFrom(this.accounts$);
}
