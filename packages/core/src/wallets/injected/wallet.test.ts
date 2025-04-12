import { BaseError } from "../../errors.js";
import { Storage as WalletStorage } from "../../storage.js";
import { InjectedWallet } from "./wallet.js";
import {
  connectInjectedExtension,
  type InjectedExtension,
  type InjectedPolkadotAccount,
} from "polkadot-api/pjs-signer";
import { firstValueFrom } from "rxjs";
import { skip } from "rxjs/operators";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

export const inMemoryStorage = new WalletStorage({
  prefix: "@reactive-dot",
  storage: inMemorySimpleStorage,
});

const mockAccounts = [
  {
    address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    name: "Alice",
  },
  { address: "5FHneW46xTkTDzSqdcWpzrLkERJZvm1tZsgU9LgANEGj9eJ6", name: "Bob" },
] as unknown as InjectedPolkadotAccount[];

const mockExtension = {
  name: "Test Wallet",
  getAccounts: vi.fn(() => mockAccounts),
  subscribe: vi.fn((_) => () => undefined),
  disconnect: vi.fn(),
} satisfies InjectedExtension;

vi.mock("polkadot-api/pjs-signer", () => ({
  connectInjectedExtension: vi.fn(async () => mockExtension),
}));

const name = "Test Wallet";
let wallet: InjectedWallet;
let storage: WalletStorage;

beforeEach(() => {
  storage = inMemoryStorage;
  wallet = new InjectedWallet(name, { storage });

  // @ts-expect-error for testing purposes
  wallet.storage.removeItem("connected");

  vi.resetAllMocks();
});

it("should initialize with the correct id", () => {
  expect(wallet.id).toBe(`injected/${name}`);
});

it("should connect to the injected extension", async () => {
  await wallet.connect();

  expect(connectInjectedExtension).toHaveBeenCalledWith(name, undefined);
  // @ts-expect-error for testing purposes
  expect(wallet.storage.getItem("connected")).toBe(JSON.stringify(true));
});

it("should disconnect from the injected extension", async () => {
  await wallet.connect();
  await wallet.disconnect();

  expect(mockExtension.disconnect).toHaveBeenCalled();

  // @ts-expect-error for testing purposes
  expect(wallet.storage.getItem("connected")).toBe(null);
});

it("should emit connection status changes", async () => {
  await wallet.connect();

  expect(await firstValueFrom(wallet.connected$)).toBe(true);

  wallet.disconnect();

  expect(await firstValueFrom(wallet.connected$)).toBe(false);
});

describe("accounts$", () => {
  it("should emit accounts when the extension is connected", async () => {
    await wallet.connect();

    expect(await firstValueFrom(wallet.accounts$)).toEqual([
      {
        id: expect.any(String),
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        name: "Alice",
      },
      {
        id: expect.any(String),
        address: "5FHneW46xTkTDzSqdcWpzrLkERJZvm1tZsgU9LgANEGj9eJ6",
        name: "Bob",
      },
    ]);
  });

  it("should emit an empty array when the extension is not connected", async () => {
    expect(await firstValueFrom(wallet.accounts$)).toEqual([]);
  });

  it("should subscribe to extension account changes", async () => {
    const firstAccountSet = [
      {
        id: expect.any(String),
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        name: "Alice",
      },
    ] as unknown as InjectedPolkadotAccount[];

    const secondAccountSet = [
      {
        id: expect.any(String),
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        name: "Alice",
      },
      {
        id: expect.any(String),
        address: "5FHneW46xTkTDzSqdcWpzrLkERJZvm1tZsgU9LgANEGj9eJ6",
        name: "Bob",
      },
    ] as unknown as InjectedPolkadotAccount[];

    const thirdAccountSet = [
      {
        id: expect.any(String),
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        name: "Alice",
      },
      {
        id: expect.any(String),
        address: "5FHneW46xTkTDzSqdcWpzrLkERJZvm1tZsgU9LgANEGj9eJ6",
        name: "Bob",
      },
      {
        id: expect.any(String),
        address: "5GNJqTPyNqANVm9MRFYGS3KTAzoWqPmmWStZkJN5WJkXP6HL",
        name: "Charlie",
      },
    ] as unknown as InjectedPolkadotAccount[];

    mockExtension.getAccounts.mockReturnValue(firstAccountSet);
    mockExtension.subscribe.mockImplementation((cb) => {
      cb(secondAccountSet);
      cb(thirdAccountSet);
      return () => {};
    });

    await wallet.connect();

    expect(await firstValueFrom(wallet.accounts$)).toEqual(firstAccountSet);
    expect(await firstValueFrom(wallet.accounts$.pipe(skip(1)))).toEqual(
      secondAccountSet,
    );
    expect(await firstValueFrom(wallet.accounts$.pipe(skip(2)))).toEqual(
      thirdAccountSet,
    );
  });
});

describe("getAccounts", () => {
  it("should return accounts when the extension is connected", async () => {
    await wallet.connect();

    const accounts = wallet.getAccounts();

    expect(accounts).toEqual([
      {
        id: expect.any(String),
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        name: "Alice",
      },
      {
        id: expect.any(String),
        address: "5FHneW46xTkTDzSqdcWpzrLkERJZvm1tZsgU9LgANEGj9eJ6",
        name: "Bob",
      },
    ]);
  });

  it("should throw an error when the extension is not connected", () => {
    expect(() => wallet.getAccounts()).toThrow(BaseError);
  });
});

describe("initialize", () => {
  it("should connect if 'connected' is in storage", async () => {
    // @ts-expect-error for testing purposes
    wallet.storage.setItem("connected", JSON.stringify(true));

    await wallet.initialize();

    expect(connectInjectedExtension).toHaveBeenCalledWith(name, undefined);
  });

  it("should not connect if 'connected' is not in storage", async () => {
    await wallet.initialize();

    expect(connectInjectedExtension).not.toHaveBeenCalled();
  });
});
