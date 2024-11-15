import type { PolkadotSignerAccount } from "../wallets/account.js";
import { WalletProvider } from "../wallets/provider.js";
import { Wallet } from "../wallets/wallet.js";
import { aggregateWallets } from "./aggregate-wallets.js";
import { Observable } from "rxjs";
import { it, expect } from "vitest";

class MockWallet extends Wallet {
  id = "mock";

  name = "Mock";

  initialize() {
    throw new Error("Method not implemented.");
  }

  connected$ = new Observable<boolean>();

  connect() {
    throw new Error("Method not implemented.");
  }

  disconnect() {
    throw new Error("Method not implemented.");
  }

  accounts$ = new Observable<PolkadotSignerAccount[]>();
}

class MockProvider extends WalletProvider {
  getWallets() {
    return Array.from({ length: 10 }).map(() => new MockWallet());
  }
}

it("aggregates wallets from provider", async () => {
  const wallets = await aggregateWallets([
    new MockWallet(),
    new MockProvider(),
  ]);

  expect(wallets).toHaveLength(11);

  for (const wallet of wallets) {
    expect(wallet).toBeInstanceOf(Wallet);
  }
});

it("only aggregate once", async () => {
  const walletsAndProviders = [
    new MockWallet(),
    new MockProvider(),
    new MockWallet(),
    new MockProvider(),
  ];

  const [firstRunWallets, secondRunWallets] = await Promise.all([
    aggregateWallets(walletsAndProviders),
    aggregateWallets(walletsAndProviders),
  ]);

  expect(firstRunWallets).toHaveLength(secondRunWallets.length);

  for (const [index, wallet] of firstRunWallets.entries()) {
    expect(wallet).toBe(secondRunWallets.at(index));
  }
});
