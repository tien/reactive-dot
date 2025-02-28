import { InjectedWalletProvider } from "./provider.js";
import { InjectedWallet } from "./wallet.js";
import { getInjectedExtensions } from "polkadot-api/pjs-signer";
import { beforeEach, expect, it, vi } from "vitest";

vi.mock("polkadot-api/pjs-signer", () => ({
  getInjectedExtensions: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it("should get wallets from extensions", async () => {
  const mockExtensions = ["extension1", "extension2"];
  vi.mocked(getInjectedExtensions).mockReturnValue(mockExtensions);

  const provider = new InjectedWalletProvider();
  const wallets = await provider.getWallets();

  expect(getInjectedExtensions).toHaveBeenCalled();
  expect(wallets).toEqual(
    expect.arrayContaining([
      expect.any(InjectedWallet),
      expect.any(InjectedWallet),
    ]),
  );
});

it("should pass options to created wallets", async () => {
  const options = { originName: "test" };
  const mockExtensions = ["extension1"];

  vi.mocked(getInjectedExtensions).mockReturnValue(mockExtensions);

  const provider = new InjectedWalletProvider(options);
  const wallets = await provider.getWallets();

  // @ts-expect-error for testing purposes
  expect(wallets[0]?.options).toEqual(options);
});
