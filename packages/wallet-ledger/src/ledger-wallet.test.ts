import { AccountMismatchError } from "./errors.js";
import { LedgerWallet } from "./ledger-wallet.js";
import { Storage as WalletStorage } from "@reactive-dot/core";
import { firstValueFrom } from "rxjs";
import { beforeEach, expect, it, vi } from "vitest";

const mockTransportCreate = vi.fn().mockResolvedValue({});
const mockGetPubkey = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]));
const mockSignTx = vi.fn().mockResolvedValue(new Uint8Array([4, 5, 6]));
const mockSignBytes = vi.fn().mockResolvedValue(new Uint8Array([7, 8, 9]));

vi.mock("@ledgerhq/hw-transport-webusb", () => ({
  default: {
    create: mockTransportCreate,
  },
}));

vi.mock("@polkadot-api/ledger-signer", () => ({
  LedgerSigner: class MockLedgerSigner {
    getPubkey = mockGetPubkey;
    getPolkadotSigner = () => ({
      signTx: mockSignTx,
      signBytes: mockSignBytes,
      publicKey: new Uint8Array([1, 2, 3]),
    });
    constructor() {}
  },
}));

let wallet: LedgerWallet;

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

  wallet = new LedgerWallet({ storage: inMemoryStorage });

  vi.clearAllMocks();
});

it("should initialize with empty accounts from storage", () => {
  wallet.initialize();

  expect(wallet.accountStore.values()).toEqual([]);
});

it("should initialize with accounts from storage", () => {
  const mockAccount = {
    publicKey: "0x010203",
    path: 0,
  };

  // @ts-expect-error using protected method for testing
  wallet.storage.setItem("accounts", JSON.stringify([mockAccount]));
  wallet.initialize();

  const accounts = wallet.accountStore.values();

  expect(accounts).toHaveLength(1);
  expect(accounts[0]?.publicKey).toEqual(new Uint8Array([1, 2, 3]));
  expect(accounts[0]?.path).toEqual(0);
});

it("should connect and add a new account", async () => {
  wallet.initialize();
  await wallet.connect();

  const accounts = wallet.accountStore.values();

  expect(accounts).toHaveLength(1);
  expect(accounts[0]?.publicKey).toEqual(new Uint8Array([1, 2, 3]));
  expect(accounts[0]?.path).toEqual(0);
});

it("should disconnect and clear accounts", () => {
  wallet.initialize();
  wallet.accountStore.add({
    id: "0x010203",
    publicKey: new Uint8Array([1, 2, 3]),
    path: 0,
  });
  wallet.disconnect();

  expect(wallet.accountStore.values()).toEqual([]);
});

it("accountStore.add should add a new account", () => {
  wallet.initialize();

  const newAccount = {
    id: "0x040506",
    publicKey: new Uint8Array([4, 5, 6]),
    path: 1,
  };

  wallet.accountStore.add(newAccount);

  expect(wallet.accountStore.values()).toContain(newAccount);
});

it("accountStore.clear should clear all accounts", () => {
  wallet.initialize();
  wallet.accountStore.add({
    id: "0x010203",
    publicKey: new Uint8Array([1, 2, 3]),
    path: 0,
  });
  wallet.accountStore.clear();

  expect(wallet.accountStore.values()).toEqual([]);
});

it("accountStore.delete should delete an account by id", () => {
  wallet.initialize();

  const account1 = {
    id: "0x010203",
    publicKey: new Uint8Array([1, 2, 3]),
    path: 0,
  };

  const account2 = {
    id: "0x040506",
    publicKey: new Uint8Array([4, 5, 6]),
    path: 1,
  };

  wallet.accountStore.add(account1);
  wallet.accountStore.add(account2);
  wallet.accountStore.delete("0x010203");

  expect(wallet.accountStore.values()).not.toContain(account1);
  expect(wallet.accountStore.values()).toContain(account2);
});

it("accountStore.has should return true if account exists", () => {
  wallet.initialize();

  const account = {
    id: "0x010203",
    publicKey: new Uint8Array([1, 2, 3]),
    path: 0,
  };

  wallet.accountStore.add(account);

  expect(wallet.accountStore.has("0x010203")).toBe(true);
  expect(wallet.accountStore.has({ id: "0x010203" })).toBe(true);
  expect(wallet.accountStore.has("0x040506")).toBe(false);
});

it("getConnectedAccount should return the connected account", async () => {
  wallet.initialize();

  const account = await wallet.getConnectedAccount(0);

  expect(account.publicKey).toEqual(new Uint8Array([1, 2, 3]));
  expect(account.path).toEqual(0);
});

it("should sign a transaction", async () => {
  wallet.initialize();

  const account = {
    id: "0x010203",
    publicKey: new Uint8Array([1, 2, 3]),
    path: 0,
  };

  wallet.accountStore.add(account);

  const accounts = await firstValueFrom(wallet.accounts$);
  await accounts[0]!
    // @ts-expect-error we know that this is a function
    .polkadotSigner({ tokenSymbol: "DOT", tokenDecimals: 10 })
    .signTx(new Uint8Array([10, 11, 12]));

  expect(mockSignTx).toHaveBeenCalledWith(new Uint8Array([10, 11, 12]));
});

it("should sign bytes", async () => {
  wallet.initialize();

  const account = {
    id: "0x010203",
    publicKey: new Uint8Array([1, 2, 3]),
    path: 0,
  };

  wallet.accountStore.add(account);

  const accounts = await firstValueFrom(wallet.accounts$);
  await accounts[0]!
    // @ts-expect-error we know that this is a function
    .polkadotSigner({ tokenSymbol: "DOT", tokenDecimals: 10 })
    .signBytes(new Uint8Array([10, 11, 12]));

  expect(mockSignBytes).toHaveBeenCalledWith(new Uint8Array([10, 11, 12]));
});

it("should throw AccountMismatchError if public keys do not match", async () => {
  mockGetPubkey.mockResolvedValueOnce(new Uint8Array([9, 9, 9]));
  wallet.initialize();

  const account = {
    id: "0x010203",
    publicKey: new Uint8Array([1, 2, 3]),
    path: 0,
  };

  wallet.accountStore.add(account);

  const accounts = await firstValueFrom(wallet.accounts$);

  await expect(() =>
    accounts[0]!
      // @ts-expect-error we know that this is a function
      .polkadotSigner({ tokenSymbol: "DOT", tokenDecimals: 10 })
      .signBytes(new Uint8Array([10, 11, 12])),
  ).rejects.toThrow(AccountMismatchError);
});

it("connected$ should emit true when accounts are added", async () => {
  wallet.initialize();

  const connected = await firstValueFrom(wallet.connected$);

  expect(connected).toBe(false);

  wallet.accountStore.add({
    id: "0x010203",
    publicKey: new Uint8Array([1, 2, 3]),
    path: 0,
  });

  const connected2 = await firstValueFrom(wallet.connected$);

  expect(connected2).toBe(true);
});

it("should save accounts to storage when accounts change", () => {
  wallet.initialize();

  const account = {
    id: "0x010203",
    publicKey: new Uint8Array([1, 2, 3]),
    path: 0,
  };

  wallet.accountStore.add(account);

  expect(
    JSON.parse(
      // @ts-expect-error using protected method for testing
      wallet.storage.getItem("accounts"),
    ),
  ).toEqual([{ path: 0, publicKey: "0x010203" }]);
});
