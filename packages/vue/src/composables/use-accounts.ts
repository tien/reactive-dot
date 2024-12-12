import type { ChainComposableOptions } from "../types.js";
import { useAsyncData } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useChainSpecDataPromise } from "./use-chain-spec-data.js";
import { useLazyValue } from "./use-lazy-value.js";
import { useConnectedWalletsObservable } from "./use-wallets.js";
import { getAccounts } from "@reactive-dot/core/internal/actions.js";
import { computed } from "vue";

/**
 * Composable for getting currently connected accounts.
 *
 * @param options - Additional options
 * @returns The currently connected accounts
 */
export function useAccounts(options?: ChainComposableOptions) {
  return useAsyncData(useAccountsPromise(options));
}

function useAccountsPromise(options?: ChainComposableOptions) {
  const chainId = internal_useChainId({ ...options, optionalChainId: true });
  const connectedWalletsObservable = useConnectedWalletsObservable();
  const chainSpecPromise = useChainSpecDataPromise(options);

  return useLazyValue(
    computed(() =>
      chainId.value === undefined ? ["accounts"] : ["accounts", chainId.value],
    ),
    () => getAccounts(connectedWalletsObservable.value, chainSpecPromise.value),
  );
}
