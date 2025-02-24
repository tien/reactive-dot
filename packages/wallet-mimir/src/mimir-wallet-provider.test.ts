import { MimirWalletProvider } from "./mimir-wallet-provider.js";
import { MimirWallet } from "./mimir-wallet.js";
import { isMimirReady } from "@mimirdev/apps-inject";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@mimirdev/apps-inject");
vi.mock("./mimir-wallet.js");

let provider: MimirWalletProvider;

beforeEach(() => {
  provider = new MimirWalletProvider();

  vi.clearAllMocks();
});

describe("getWallets", () => {
  it("should return empty array when Mimir is not ready", async () => {
    vi.mocked(isMimirReady).mockResolvedValue(null);
    const wallets = await provider.getWallets();

    expect(wallets).toEqual([]);
    expect(isMimirReady).toHaveBeenCalled();
  });

  it("should return MimirWallet instance when Mimir is ready", async () => {
    vi.mocked(isMimirReady).mockResolvedValue("origin");
    const wallets = await provider.getWallets();

    expect(wallets).toHaveLength(1);
    expect(wallets[0]).toBeInstanceOf(MimirWallet);
  });
});
