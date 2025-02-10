import { getPolkadotSignerFromPjs } from "@polkadot-api/pjs-signer";
import { ReactiveDotError } from "@reactive-dot/core";
import {
  DeepLinkWallet,
  type PolkadotSignerAccount,
} from "@reactive-dot/core/wallets.js";
import type {
  WalletConnectModal,
  WalletConnectModalConfig,
} from "@walletconnect/modal";
import type { ISignClient, SessionTypes } from "@walletconnect/types";
import type {
  IUniversalProvider,
  UniversalProviderOpts,
} from "@walletconnect/universal-provider";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

export class WalletConnect extends DeepLinkWallet {
  readonly #providerOptions: UniversalProviderOpts;

  #provider: IUniversalProvider | undefined;

  #modal: WalletConnectModal | undefined;

  readonly #modalOptions: WalletConnectModalConfig;

  readonly #chainIds: string[];

  readonly #optionalChainIds: string[];

  readonly #session = new BehaviorSubject<SessionTypes.Struct | undefined>(
    undefined,
  );

  #requestId = 0;

  readonly id = "wallet-connect";

  readonly name = "WalletConnect";

  constructor(options: {
    projectId?: string;
    providerOptions: Omit<UniversalProviderOpts, "projectId">;
    modalOptions?: Omit<WalletConnectModalConfig, "projectId">;
    chainIds?: string[];
    optionalChainIds?: string[];
  }) {
    super(undefined);

    this.#providerOptions =
      options.projectId === undefined
        ? options.providerOptions
        : { ...options.providerOptions, projectId: options.projectId };

    this.#modalOptions = {
      ...(options.modalOptions ?? {}),
      projectId: options.projectId,
    };

    this.#chainIds = options.chainIds ?? [];
    this.#optionalChainIds = options.optionalChainIds ?? [];
  }

  async initialize() {
    const { UniversalProvider } = await import(
      "@walletconnect/universal-provider"
    );

    this.#provider ??= await UniversalProvider.init(this.#providerOptions);

    if (this.#provider.session !== undefined) {
      return this.#session.next(this.#provider.session);
    }
  }

  readonly connected$ = this.#session.pipe(
    map((session) => session !== undefined),
  );

  async initiateConnectionHandshake() {
    await this.initialize();

    if (this.#provider?.client === undefined) {
      throw new ReactiveDotError(
        "Wallet connect provider doesn't have any client",
      );
    }

    if (this.#chainIds.length === 0 && this.#optionalChainIds.length === 0) {
      throw new ReactiveDotError(
        "Either chainIds or optionalChainIds must be provided",
      );
    }

    const connectOptions: Parameters<ISignClient["connect"]>[0] = {};

    if (this.#chainIds.length > 0) {
      connectOptions.requiredNamespaces = {
        polkadot: {
          methods: ["polkadot_signTransaction", "polkadot_signMessage"],
          chains: this.#chainIds,
          events: ['chainChanged", "accountsChanged'],
        },
      };
    }

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
      throw new ReactiveDotError("No URI provided by connection");
    }

    return {
      uri,
      settled: approval().then((session) => {
        this.#session.next(session);

        // TODO: only happen after connect, not reconnect
        // report this to WalletConnect
        if (this.#provider) {
          this.#provider.session = session;
        }
      }),
    };
  }

  async connect() {
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
      throw new ReactiveDotError("Modal was closed");
    }

    modal.closeModal();
  }

  async disconnect() {
    await this.#provider?.disconnect();
    this.#session.next(undefined);
  }

  readonly accounts$ = this.#session.pipe(
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
          ([chainType, chainId, address]): PolkadotSignerAccount => ({
            id: `${chainType}:${chainId}:${address}`,
            genesisHash: chainId,
            polkadotSigner: getPolkadotSignerFromPjs(
              address,
              (payload) =>
                this.#provider!.client!.request<{ signature: string }>({
                  topic: session.topic,
                  chainId: `${chainType}:${chainId}`,
                  request: {
                    method: "polkadot_signTransaction",
                    params: {
                      address: payload.address,
                      transactionPayload: payload,
                    },
                  },
                }),
              async (payload) => {
                const { signature } = await this.#provider!.client!.request<{
                  signature: `0x${string}`;
                }>({
                  topic: session.topic,
                  chainId: `${chainType}:${chainId}`,
                  request: {
                    method: "polkadot_signMessage",
                    params: { address: payload.address, message: payload.data },
                  },
                });

                return { id: this.#requestId++, signature };
              },
            ),
          }),
        );
    }),
  );

  async #getModal() {
    if (this.#modal !== undefined) {
      return this.#modal;
    }

    const { WalletConnectModal } = await import("@walletconnect/modal");

    this.#modal = new WalletConnectModal(this.#modalOptions);

    return this.#modal;
  }
}
