import * as exports from "./index.js";
import { expect, it } from "vitest";

it("should match inline snapshot", () =>
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "QueryRenderer",
      "ChainProvider",
      "ReactiveDotProvider",
      "QueryOptionsProvider",
      "SignerProvider",
      "useAccounts",
      "useSpendableBalance",
      "useBlock",
      "useChainId",
      "useChainIds",
      "useChainSpecData",
      "useClient",
      "useConfig",
      "useContractMutation",
      "useMutationEffect",
      "useMutation",
      "useNativeTokenAmountFromNumber",
      "useNativeTokenAmountFromPlanck",
      "useQueryErrorResetter",
      "useQueryLoader",
      "useQueryRefresher",
      "useLazyLoadQuery",
      "useLazyLoadQueryWithRefresh",
      "useSigner",
      "useTypedApi",
      "useWalletConnector",
      "useWalletDisconnector",
      "useConnectedWallets",
      "useWallets",
    ]
  `));
