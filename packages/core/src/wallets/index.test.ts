import * as exports from "./index.js";
import { expect, it } from "vitest";

it("should match inline snapshot", () =>
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "WalletProvider",
      "DeepLinkWallet",
      "initializeWallets",
      "InjectedWalletProvider",
      "InjectedWallet",
      "LocalWallet",
      "Wallet",
    ]
  `));
