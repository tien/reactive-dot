import * as exports from "./index.js";
import { expect, it } from "vitest";

it("should match inline snapshot", () =>
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "aggregateWallets",
      "connectWallet",
      "disconnectWallet",
      "getAccounts",
      "getBlock",
      "getClient",
      "getConnectedWallets",
      "initializeWallets",
      "preflight",
      "query",
      "unstable_getBlockExtrinsics",
    ]
  `));
