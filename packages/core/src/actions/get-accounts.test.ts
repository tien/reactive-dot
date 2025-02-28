import type { Wallet } from "../wallets/wallet.js";
import { getAccounts } from "./get-accounts.js";
import type { ChainSpecData } from "@polkadot-api/substrate-client";
import { firstValueFrom, of } from "rxjs";
import { expect, it, vi } from "vitest";

it("should return an empty array if no wallets are provided", async () => {
  const accounts = await firstValueFrom(getAccounts([]));
  expect(accounts).toEqual([]);
});

it("should return an empty array if wallets are empty", async () => {
  const accounts = await firstValueFrom(getAccounts(of([])));
  expect(accounts).toEqual([]);
});

it("should return accounts from multiple wallets", async () => {
  const mockWallet1 = {
    accounts$: of([
      {
        address: "address1",
        name: "Account 1",
        type: "ed25519",
        genesisHash: "genesisHash1",
        polkadotSigner: {
          sign: vi.fn(),
          publicKey: new Uint8Array([1, 2, 3]),
        },
      },
    ]),
  } as unknown as Wallet;

  const mockWallet2 = {
    accounts$: of([
      {
        address: "address2",
        name: "Account 2",
        type: "sr25519",
        genesisHash: "genesisHash2",
        polkadotSigner: {
          sign: vi.fn(),
          publicKey: new Uint8Array([4, 5, 6]),
        },
      },
    ]),
  } as unknown as Wallet;

  const accounts = await firstValueFrom(
    getAccounts([mockWallet1, mockWallet2]),
  );

  expect(accounts.length).toBe(2);
  expect(accounts[0]?.address).toBeDefined();
  expect(accounts[1]?.address).toBeDefined();
});

it("should filter accounts based on genesisHash when chainSpec is provided", async () => {
  const mockWallet = {
    accounts$: of([
      {
        address: "address1",
        name: "Account 1",
        type: "ed25519",
        genesisHash: "genesisHash1",
        polkadotSigner: {
          sign: vi.fn(),
          publicKey: new Uint8Array([1, 2, 3]),
        },
      },
      {
        address: "address2",
        name: "Account 2",
        type: "sr25519",
        genesisHash: "genesisHash2",
        polkadotSigner: {
          sign: vi.fn(),
          publicKey: new Uint8Array([4, 5, 6]),
        },
      },
    ]),
  } as unknown as Wallet;

  const chainSpec: ChainSpecData = {
    name: "Foo",
    genesisHash: "genesisHash2",
    properties: {
      ss58Format: 42,
      tokenDecimals: 12,
      tokenSymbol: "DOT",
    },
  };

  const accounts = await firstValueFrom(getAccounts([mockWallet], chainSpec));

  expect(accounts.length).toBe(1);
  expect(accounts[0]?.genesisHash).toBe("genesisHash2");
});

it("should handle undefined genesisHash in account", async () => {
  const mockWallet = {
    accounts$: of([
      {
        address: "address1",
        name: "Account 1",
        type: "ed25519",
        polkadotSigner: {
          sign: vi.fn(),
          publicKey: new Uint8Array([1, 2, 3]),
        },
      },
    ]),
  } as unknown as Wallet;

  const chainSpec: ChainSpecData = {
    name: "Foo",
    genesisHash: "0x0",
    properties: {
      ss58Format: 42,
      tokenDecimals: 12,
      tokenSymbol: "DOT",
    },
  };

  const accounts = await firstValueFrom(getAccounts([mockWallet], chainSpec));

  expect(accounts.length).toBe(1);
});

it("should handle undefined chainSpec", async () => {
  const mockWallet = {
    accounts$: of([
      {
        address: "address1",
        name: "Account 1",
        type: "ed25519",
        genesisHash: "genesisHash1",
        polkadotSigner: {
          sign: vi.fn(),
          publicKey: new Uint8Array([1, 2, 3]),
        },
      },
    ]),
  } as unknown as Wallet;

  const accounts = await firstValueFrom(getAccounts([mockWallet], undefined));

  expect(accounts.length).toBe(1);
  expect(accounts[0]?.address).toBeDefined();
});

it("should handle account.polkadotSigner as a function", async () => {
  const mockWallet = {
    accounts$: of([
      {
        address: "address1",
        name: "Account 1",
        type: "ed25519",
        genesisHash: "genesisHash1",
        polkadotSigner: vi.fn().mockReturnValue({
          sign: vi.fn(),
          publicKey: new Uint8Array([1, 2, 3]),
        }),
      },
    ]),
  } as unknown as Wallet;

  const chainSpec: ChainSpecData = {
    name: "Foo",
    genesisHash: "genesisHash1",
    properties: {
      ss58Format: 42,
      tokenDecimals: 12,
      tokenSymbol: "DOT",
    },
  };

  const accounts = await firstValueFrom(getAccounts([mockWallet], chainSpec));

  expect(accounts.length).toBe(1);
  expect(accounts[0]?.address).toBeDefined();
});

it("should handle account.polkadotSigner as a function and return undefined if chainSpec is undefined", async () => {
  const mockWallet = {
    accounts$: of([
      {
        address: "address1",
        name: "Account 1",
        type: "ed25519",
        genesisHash: "genesisHash1",
        polkadotSigner: vi.fn().mockReturnValue({
          sign: vi.fn(),
          publicKey: new Uint8Array([1, 2, 3]),
        }),
      },
    ]),
  } as unknown as Wallet;

  const accounts = await firstValueFrom(getAccounts([mockWallet], undefined));

  expect(accounts.length).toBe(0);
});

it("should handle account.polkadotSigner as a function and return undefined if it returns undefined", async () => {
  const mockWallet = {
    accounts$: of([
      {
        address: "address1",
        name: "Account 1",
        type: "ed25519",
        genesisHash: "genesisHash1",
        polkadotSigner: vi.fn().mockReturnValue(undefined),
      },
    ]),
  } as unknown as Wallet;

  const chainSpec: ChainSpecData = {
    name: "Foo",
    genesisHash: "0x0",
    properties: {
      ss58Format: 42,
      tokenDecimals: 12,
      tokenSymbol: "DOT",
    },
  };

  const accounts = await firstValueFrom(getAccounts([mockWallet], chainSpec));

  expect(accounts.length).toBe(0);
});
