import * as exports from "./index.js";
import { expect, it } from "vitest";

it("should match inline snapshot", () =>
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "useAccounts",
      "useSpendableBalance",
      "useSpendableBalances",
      "useBlock",
      "useChainId",
      "useChainIds",
      "useChainSpecData",
      "useClient",
      "useConfig",
      "useContractMutation",
      "useMutation",
      "useNativeToken",
      "useQueryErrorResetter",
      "useQuery",
      "useSigner",
      "useTypedApi",
      "useWalletConnector",
      "useWalletDisconnector",
      "useConnectedWallets",
      "useWallets",
      "watchMutationEffect",
      "ReactiveDotPlugin",
      "provideChain",
      "provideSigner",
    ]
  `));
