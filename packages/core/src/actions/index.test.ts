import * as exports from "./index.js";
import { expect, it } from "vitest";

it("should match inline snapshot", () =>
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "getInkContractTx",
      "getInkClient",
      "queryInk",
      "aggregateWallets",
      "connectWallet",
      "disconnectWallet",
      "getAccounts",
      "unstable_getBlockExtrinsics",
      "getBlock",
      "getClient",
      "getConnectedWallets",
      "initializeWallets",
      "preflight",
      "query",
    ]
  `));
