import type { Wallet } from "../wallets/wallet.js";
import { disconnectWallet } from "./disconnect-wallet.js";
import { expect, it, vi } from "vitest";

it("should disconnect a single wallet", async () => {
  const mockWallet = {
    disconnect: vi.fn().mockResolvedValue(undefined),
  } as unknown as Wallet;

  await disconnectWallet(mockWallet);

  expect(mockWallet.disconnect).toHaveBeenCalledTimes(1);
});

it("should disconnect multiple wallets", async () => {
  const mockWallet1 = {
    disconnect: vi.fn().mockResolvedValue(undefined),
  } as unknown as Wallet;

  const mockWallet2 = {
    disconnect: vi.fn().mockResolvedValue(undefined),
  } as unknown as Wallet;

  await disconnectWallet([mockWallet1, mockWallet2]);

  expect(mockWallet1.disconnect).toHaveBeenCalledTimes(1);
  expect(mockWallet2.disconnect).toHaveBeenCalledTimes(1);
});

it("should handle an empty array of wallets", async () => {
  await expect(disconnectWallet([])).resolves.toBeUndefined();
});

it("should handle a wallet that fails to disconnect", async () => {
  const mockWallet = {
    disconnect: vi.fn().mockRejectedValue(new Error("Failed to disconnect")),
  } as unknown as Wallet;

  await expect(disconnectWallet(mockWallet)).rejects.toThrow(
    "Failed to disconnect",
  );
});
