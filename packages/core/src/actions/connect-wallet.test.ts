import type { Wallet } from "../wallets/wallet.js";
import { connectWallet } from "./connect-wallet.js";
import { expect, it, vi } from "vitest";

it("should connect a single wallet", async () => {
  const wallet = {
    connect: vi.fn().mockResolvedValue(undefined),
  } as unknown as Wallet;

  await connectWallet(wallet);

  expect(wallet.connect).toHaveBeenCalledTimes(1);
});

it("should connect multiple wallets", async () => {
  const wallet1 = {
    connect: vi.fn().mockResolvedValue(undefined),
  } as unknown as Wallet;
  const wallet2 = {
    connect: vi.fn().mockResolvedValue(undefined),
  } as unknown as Wallet;

  await connectWallet([wallet1, wallet2]);

  expect(wallet1.connect).toHaveBeenCalledTimes(1);
  expect(wallet2.connect).toHaveBeenCalledTimes(1);
});

it("should handle an empty array of wallets", async () => {
  await expect(connectWallet([])).resolves.toBeUndefined();
});

it("should handle a wallet that fails to connect", async () => {
  const wallet = {
    connect: vi.fn().mockRejectedValue(new Error("Failed to connect")),
  } as unknown as Wallet;

  await expect(connectWallet(wallet)).rejects.toThrow("Failed to connect");
});

it("should handle multiple wallets where one fails to connect", async () => {
  const wallet1 = {
    connect: vi.fn().mockResolvedValue(undefined),
  } as unknown as Wallet;

  const wallet2 = {
    connect: vi.fn().mockRejectedValue(new Error("Failed to connect")),
  } as unknown as Wallet;

  await expect(connectWallet([wallet1, wallet2])).rejects.toThrow(
    "Failed to connect",
  );
  expect(wallet1.connect).toHaveBeenCalledTimes(1);
  expect(wallet2.connect).toHaveBeenCalledTimes(1);
});
