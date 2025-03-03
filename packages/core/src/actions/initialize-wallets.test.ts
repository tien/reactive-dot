import type { Wallet } from "../wallets/wallet.js";
import { initializeWallets } from "./initialize-wallets.js";
import { expect, it, vi } from "vitest";

it("calls wallet.initialize for each wallet and returns their results", async () => {
  const wallet1 = {
    initialize: vi.fn(() => Promise.resolve()),
  } as unknown as Wallet;

  const wallet2 = {
    initialize: vi.fn(() => Promise.resolve()),
  } as unknown as Wallet;

  const wallets = [wallet1, wallet2];

  const results = await initializeWallets(wallets);

  expect(wallet1.initialize).toHaveBeenCalled();
  expect(wallet2.initialize).toHaveBeenCalled();
  expect(results).toEqual([undefined, undefined]);
});

it("only calls wallet.initialize once for each wallet", async () => {
  const wallet1 = {
    initialize: vi.fn(() => Promise.resolve()),
  } as unknown as Wallet;

  const wallet2 = {
    initialize: vi.fn(() => Promise.resolve()),
  } as unknown as Wallet;

  const wallets = [wallet1, wallet2];

  await initializeWallets(wallets);
  await initializeWallets(wallets);

  expect(wallet1.initialize).toHaveBeenCalledTimes(1);
  expect(wallet2.initialize).toHaveBeenCalledTimes(1);
});

it("returns an empty array when given no wallets", async () => {
  const wallets: Wallet[] = [];

  const results = await initializeWallets(wallets);

  expect(results).toEqual([]);
});

it("rejects when any wallet.initialize fails", async () => {
  const errorMessage = "Initialization failed";

  const wallet1 = {
    initialize: vi.fn(() => Promise.resolve("wallet1 initialized")),
  } as unknown as Wallet;

  const wallet2 = {
    initialize: vi.fn(() => Promise.reject(new Error(errorMessage))),
  } as unknown as Wallet;

  const wallets = [wallet1, wallet2];

  await expect(initializeWallets(wallets)).rejects.toThrow(errorMessage);
});
