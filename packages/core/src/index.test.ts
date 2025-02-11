import * as exports from "./index.js";
import { expect, it } from "vitest";

it("should match inline snapshot", () =>
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "defineConfig",
      "MutationError",
      "QueryError",
      "ReactiveDotError",
      "Query",
      "Storage",
      "idle",
      "pending",
      "aggregateWallets",
      "connectWallet",
      "disconnectWallet",
      "getAccounts",
      "getBlock",
      "unstable_getBlockExtrinsics",
      "getClient",
      "getConnectedWallets",
      "initializeWallets",
      "preflight",
      "query",
    ]
  `));
