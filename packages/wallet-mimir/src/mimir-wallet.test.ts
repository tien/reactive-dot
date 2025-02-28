import { MimirWallet } from "./mimir-wallet.js";
import { MimirPAPISigner } from "@mimirdev/papi-signer";
import { ReactiveDotError, Storage as WalletStorage } from "@reactive-dot/core";
import { firstValueFrom } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@mimirdev/papi-signer");

let wallet: MimirWallet;

beforeEach(() => {
  const inMemorySimpleStorage = {
    items: new Map(),
    getItem(key: string) {
      return this.items.get(key) ?? null;
    },
    removeItem(key: string) {
      this.items.delete(key);
    },
    setItem(key: string, value: string) {
      this.items.set(key, value);
    },
  };

  const inMemoryStorage = new WalletStorage({
    prefix: "@reactive-dot",
    storage: inMemorySimpleStorage,
  });

  wallet = new MimirWallet({
    originName: "test-origin",
    storage: inMemoryStorage,
  });

  vi.clearAllMocks();
});

afterEach(() => {
  wallet.disconnect();
});

describe("constructor", () => {
  it("should create instance with correct id and name", () => {
    expect(wallet.id).toBe("mimir");
    expect(wallet.name).toBe("Mimir");
  });
});

describe("connect", () => {
  it("should connect successfully", async () => {
    const mockSigner = {
      enable: vi.fn().mockResolvedValue({ result: true }),
      getAccounts: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(MimirPAPISigner).mockImplementation(
      () => mockSigner as unknown as MimirPAPISigner,
    );

    await wallet.connect();

    expect(mockSigner.enable).toHaveBeenCalledWith("test-origin");
    expect(await firstValueFrom(wallet.connected$)).toBeTruthy();
  });

  it("should throw error on failed connection", async () => {
    const mockSigner = {
      enable: vi.fn().mockResolvedValue({ result: false }),
    };

    vi.mocked(MimirPAPISigner).mockImplementation(
      () => mockSigner as unknown as MimirPAPISigner,
    );

    await expect(wallet.connect()).rejects.toThrow(ReactiveDotError);
  });
});

describe("$accounts", () => {
  it("should emit an empty array when not connected", async () => {
    const emittedAccounts = await firstValueFrom(wallet.accounts$);
    expect(emittedAccounts).toEqual([]);
  });

  it("should emit updated accounts when subscribeAccounts callback is triggered", async () => {
    // Prepare a controlled subscribeAccounts callback.
    let accountsCallback: ((accounts: unknown[]) => void) | undefined;
    const subscribeAccountsMock = vi.fn((cb: (accounts: unknown[]) => void) => {
      accountsCallback = cb;
      // Return a dummy unsubscribe function.
      return () => {};
    });

    const mockSigner = {
      enable: vi.fn().mockResolvedValue({ result: true }),
      getAccounts: vi.fn().mockResolvedValue([]),
      subscribeAccounts: subscribeAccountsMock,
      getPolkadotSigner: vi
        .fn()
        .mockImplementation((address: string) => ({ address })),
    };

    vi.mocked(MimirPAPISigner).mockImplementation(
      () => mockSigner as unknown as MimirPAPISigner,
    );

    await wallet.connect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let emittedAccounts: any[] = [];
    const subscription = wallet.accounts$.subscribe((accounts) => {
      emittedAccounts = accounts;
    });

    // Ensure subscribeAccounts was called.
    expect(subscribeAccountsMock).toHaveBeenCalled();

    // Trigger the subscription callback with mock account data.
    const mockAccountsData = [{ address: "account1" }, { address: "account2" }];
    if (accountsCallback) {
      accountsCallback(mockAccountsData);
    }

    // Allow for asynchronous propagation.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(emittedAccounts.length).toBe(2);
    expect(emittedAccounts[0]?.address).toBe("account1");
    expect(emittedAccounts[0]?.id).toBe("0");
    expect(emittedAccounts[1]?.address).toBe("account2");
    expect(emittedAccounts[1]?.id).toBe("1");

    subscription.unsubscribe();
  });
});

describe("getAccounts", () => {
  it("should throw error when not connected", async () => {
    await expect(wallet.getAccounts()).rejects.toThrow(
      "Mimir is not connected",
    );
  });

  it("should return accounts when connected", async () => {
    const mockAccounts = [{ address: "test-address" }];
    const mockSigner = {
      enable: vi.fn().mockResolvedValue({ result: true }),
      getAccounts: vi.fn().mockResolvedValue(mockAccounts),
      getPolkadotSigner: vi.fn().mockReturnValue({}),
    };

    vi.mocked(MimirPAPISigner).mockImplementation(
      () => mockSigner as unknown as MimirPAPISigner,
    );

    await wallet.connect();
    const accounts = await wallet.getAccounts();

    expect(accounts[0]?.address).toBe("test-address");
    expect(accounts[0]?.id).toBe("0");
  });
});

describe("initialize", () => {
  it("should connect if previously connected", async () => {
    const mockSigner = {
      enable: vi.fn().mockResolvedValue({ result: true }),
      getAccounts: vi.fn().mockResolvedValue([]),
    };

    vi.mocked(MimirPAPISigner).mockImplementation(
      () => mockSigner as unknown as MimirPAPISigner,
    );

    // @ts-expect-error using protected method for testing
    wallet.storage.setItem("connected", JSON.stringify(true));

    const connectSpy = vi.spyOn(wallet, "connect");
    await wallet.initialize();

    expect(connectSpy).toHaveBeenCalled();
  });
});
