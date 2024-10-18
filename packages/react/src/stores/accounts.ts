import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import { chainSpecDataAtom } from "./client.js";
import { connectedWalletsAtom } from "./wallets.js";
import { getAccounts, type ChainId, type Config } from "@reactive-dot/core";
import { atomWithObservable } from "jotai/utils";

export const accountsAtom = atomFamilyWithErrorCatcher(
  (param: { config: Config; chainId: ChainId | undefined }, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)((get) =>
      getAccounts(
        get(connectedWalletsAtom(param.config)),
        param.chainId === undefined
          ? undefined
          : // @ts-expect-error `chainId` will never be undefined
            get(chainSpecDataAtom(param)),
      ),
    ),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
