import { WalletConnect } from "./walletconnect.js";
import { BaseError } from "@reactive-dot/core";
import { WalletConnectModal } from "@walletconnect/modal";
import { UniversalProvider } from "@walletconnect/universal-provider";
import { firstValueFrom } from "rxjs";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@walletconnect/universal-provider", () => {
  const mockedProvider = {
    init: vi.fn(),
    session: undefined,
    client: {
      connect: vi.fn(),
      request: vi.fn(),
      disconnect: vi.fn(),
    },
    disconnect: vi.fn(),
  };

  return {
    UniversalProvider: {
      init: vi.fn(() => Promise.resolve(mockedProvider)),
    },
  };
});

vi.mock("@walletconnect/modal", () => {
  return {
    WalletConnectModal: vi.fn().mockImplementation(() => ({
      openModal: vi.fn(),
      closeModal: vi.fn(),
      subscribeModal: vi.fn(),
    })),
  };
});

let walletConnect: WalletConnect;
let mockProvider: Awaited<ReturnType<typeof UniversalProvider.init>>;

beforeEach(async () => {
  mockProvider = {
    init: vi.fn(),
    session: undefined,
    client: {
      connect: vi.fn(),
      request: vi.fn(),
      disconnect: vi.fn(),
    },
    disconnect: vi.fn(),
  } as unknown as Awaited<ReturnType<typeof UniversalProvider.init>>;

  vi.mocked(UniversalProvider.init).mockResolvedValue(mockProvider);

  walletConnect = new WalletConnect({
    projectId: "test-project-id",
    providerOptions: {
      relayUrl: "test-relay-url",
    },
    modalOptions: {},
    chainIds: ["polkadot:91b171bb158e2d3848fa23a9f1c25182"],
    optionalChainIds: ["polkadot:91b171bb158e2d3848fa23a9f1c25182"],
  });

  await walletConnect.initialize();
});

it("should initialize the WalletConnect instance", async () => {
  expect(UniversalProvider.init).toHaveBeenCalledWith({
    projectId: "test-project-id",
    relayUrl: "test-relay-url",
  });
});

it("should emit true to connected$ when a session exists", async () => {
  mockProvider.session = {
    topic: "test-topic",
    namespaces: {},
  } as unknown as NonNullable<typeof mockProvider.session>;

  vi.mocked(UniversalProvider.init).mockResolvedValue(mockProvider);

  await walletConnect.initialize();

  const connected = await firstValueFrom(walletConnect.connected$);

  expect(connected).toBe(true);
});

describe("initiateConnectionHandshake", () => {
  it("should throw an error if the provider client is undefined", async () => {
    // @ts-expect-error this is actually possible
    mockProvider.client = undefined;

    await expect(walletConnect.initiateConnectionHandshake()).rejects.toThrow(
      BaseError,
    );
  });

  it("should throw an error if neither chainIds nor optionalChainIds are provided", async () => {
    walletConnect = new WalletConnect({
      projectId: "test-project-id",
      providerOptions: {
        relayUrl: "test-relay-url",
      },
      modalOptions: {},
      chainIds: [],
      optionalChainIds: [],
    });

    await walletConnect.initialize();

    await expect(walletConnect.initiateConnectionHandshake()).rejects.toThrow(
      BaseError,
    );
  });

  it("should call connect on the client with the correct parameters", async () => {
    const mockConnectResult = {
      uri: "test-uri",
      approval: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(mockProvider.client.connect).mockResolvedValue(mockConnectResult);

    await walletConnect.initiateConnectionHandshake();

    expect(mockProvider.client.connect).toHaveBeenCalledWith({
      requiredNamespaces: {
        polkadot: {
          methods: ["polkadot_signTransaction", "polkadot_signMessage"],
          chains: ["polkadot:91b171bb158e2d3848fa23a9f1c25182"],
          events: ['chainChanged", "accountsChanged'],
        },
      },
      optionalNamespaces: {
        polkadot: {
          methods: ["polkadot_signTransaction", "polkadot_signMessage"],
          chains: ["polkadot:91b171bb158e2d3848fa23a9f1c25182"],
          events: ['chainChanged", "accountsChanged'],
        },
      },
    });
  });

  it("should throw an error if no URI is provided by the connection", async () => {
    const mockConnectResult = {
      approval: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(mockProvider.client.connect).mockResolvedValue(mockConnectResult);

    await expect(walletConnect.initiateConnectionHandshake()).rejects.toThrow(
      BaseError,
    );
  });

  it("should return the URI and a promise that resolves when the session is settled", async () => {
    const mockConnectResult = {
      uri: "test-uri",
      approval: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(mockProvider.client.connect).mockResolvedValue(mockConnectResult);

    const result = await walletConnect.initiateConnectionHandshake();

    expect(result.uri).toBe("test-uri");
    await expect(result.settled).resolves.toBeUndefined();
  });
});

describe("connect", () => {
  it("should open the modal with the URI returned by initiateConnectionHandshake", async () => {
    const mockConnectResult = {
      uri: "test-uri",
      approval: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(mockProvider.client.connect).mockResolvedValue(mockConnectResult);

    const modal = {
      openModal: vi.fn(),
      closeModal: vi.fn(),
      subscribeModal: vi.fn().mockImplementation(() => () => {}),
    };

    vi.mocked(WalletConnectModal).mockImplementation(() => modal);

    await walletConnect.connect();

    expect(modal.openModal).toHaveBeenCalledWith({ uri: "test-uri" });
  });

  it("should close the modal after a successful connection", async () => {
    const mockConnectResult = {
      uri: "test-uri",
      approval: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(mockProvider.client.connect).mockResolvedValue(mockConnectResult);

    const modal = {
      openModal: vi.fn(),
      closeModal: vi.fn(),
      subscribeModal: vi.fn().mockImplementation(() => () => {}),
    };

    vi.mocked(WalletConnectModal).mockImplementation(() => modal);

    // Simulate a successful connection by resolving the settled promise immediately
    vi.mocked(mockProvider.client.connect).mockResolvedValue({
      uri: "test-uri",
      approval: vi.fn().mockResolvedValue({}),
    });

    await walletConnect.connect();

    expect(modal.closeModal).toHaveBeenCalled();
  });

  it("should throw an error if the modal is closed before the connection is established", async () => {
    const mockConnectResult = {
      uri: "test-uri",
      approval: vi
        .fn()
        .mockReturnValue(
          new Promise((resolve) => setTimeout(() => resolve({}), 1000)),
        ),
    };

    vi.mocked(mockProvider.client.connect).mockResolvedValue(mockConnectResult);

    const modal = {
      openModal: vi.fn(),
      closeModal: vi.fn(),
      subscribeModal: vi
        .fn()
        .mockImplementation(
          (callback: (args: { open: boolean }) => unknown) => {
            // Simulate the modal closing immediately
            callback({ open: false });
            return () => {};
          },
        ),
    };

    vi.mocked(WalletConnectModal).mockImplementation(() => modal);

    await expect(walletConnect.connect()).rejects.toThrow("Modal was closed");
  });
});

describe("disconnect", () => {
  it("should call disconnect on the provider and clear the session", async () => {
    await walletConnect.disconnect();

    expect(mockProvider.disconnect).toHaveBeenCalled();
  });
});

describe("accounts$", () => {
  it("should emit an empty array when there is no session", async () => {
    const accounts = await firstValueFrom(walletConnect.accounts$);
    expect(accounts).toEqual([]);
  });

  it("should map the session accounts to PolkadotSignerAccount objects", async () => {
    vi.mocked(mockProvider.client.request).mockResolvedValue({
      signature: "0xsignature",
    });

    mockProvider.session = {
      topic: "test-topic",
      namespaces: {
        polkadot: {
          accounts: [
            "polkadot:91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          ],
          methods: [],
          events: [],
        },
      },
    } as unknown as NonNullable<typeof mockProvider.session>;

    vi.mocked(UniversalProvider.init).mockResolvedValue(mockProvider);

    await walletConnect.initialize();

    const accounts = await firstValueFrom(walletConnect.accounts$);

    expect(accounts).toHaveLength(1);
    expect(accounts[0]?.id).toBe(
      "polkadot:91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3:5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    );
    expect(accounts[0]?.genesisHash).toBe(
      "91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
    );
  });
});
