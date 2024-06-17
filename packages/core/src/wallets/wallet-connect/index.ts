import { ReDotError } from "../../errors.js";
import DeepLinkWallet from "../deep-link.js";
import { getPolkadotSignerFromPjs } from "./from-pjs-account.js";
import "@polkadot-api/pjs-signer";
import { AccountId } from "@polkadot-api/substrate-bindings";
import type {
  WalletConnectModal,
  WalletConnectModalConfig,
} from "@walletconnect/modal";
import type { ISignClient, SessionTypes } from "@walletconnect/types";
import type {
  IUniversalProvider,
  UniversalProviderOpts,
} from "@walletconnect/universal-provider";
import { InjectedPolkadotAccount } from "polkadot-api/pjs-signer";
import { BehaviorSubject, lastValueFrom } from "rxjs";
import { map } from "rxjs/operators";

export default class WalletConnect extends DeepLinkWallet {
  readonly #providerOptions: UniversalProviderOpts;

  #provider: IUniversalProvider | undefined;

  #modal: WalletConnectModal | undefined;

  readonly #modalOptions: WalletConnectModalConfig;

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

    this.#modalOptions = {
      ...(options.modalOptions ?? {}),
      projectId: options.projectId,
    };

    this.#chainIds = options.chainIds;
    this.#optionalChainIds = options.optionalChainIds ?? [];
  }

  override readonly initialize = async () => {
    const { UniversalProvider } = await import(
      "@walletconnect/universal-provider"
    );

    this.#provider ??= await UniversalProvider.init(this.#providerOptions);

    if (this.#provider.session !== undefined) {
      return this.#session.next(this.#provider.session);
    }
  };

  override readonly connected$ = this.#session.pipe(
    map((session) => session !== undefined),
  );

  override readonly initiateConnectionHandshake = async () => {
    await this.initialize();

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
      throw new ReDotError("No URI provided by connection");
    }

    return {
      uri,
      settled: approval().then((session) => this.#session.next(session)),
    };
  };

  override readonly connect = async () => {
    const { uri, settled } = await this.initiateConnectionHandshake();

    const connectedPromise = settled.then(() => true as const);

    const modal = await this.#getModal();

    await modal.openModal({ uri });

    const modalClosePromise = new Promise<false>((resolve) => {
      const unsubscribe = modal.subscribeModal(
        (modalState: { open: boolean }) => {
          if (!modalState.open) {
            resolve(false);
            unsubscribe();
          }
        },
      );
    });

    const connected = await Promise.race([connectedPromise, modalClosePromise]);

    if (!connected) {
      throw new ReDotError("Modal was closed");
    }

    modal.closeModal();
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

  readonly #getModal = async () => {
    if (this.#modal !== undefined) {
      return this.#modal;
    }

    const { WalletConnectModal } = await import("@walletconnect/modal");

    this.#modal = new WalletConnectModal(this.#modalOptions);

    return this.#modal;
  };
}
