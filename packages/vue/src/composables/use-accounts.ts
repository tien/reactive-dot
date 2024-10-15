import type { ChainComposableOptions } from "./types.js";
import { useAsyncData } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useChainSpecPromise } from "./use-chain-spec-data.js";
import { useLazyValue } from "./use-lazy-value.js";
import { useConnectedWalletsObservable } from "./use-wallets.js";
import { getAccounts } from "@reactive-dot/core";
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
  const chainId = internal_useChainId(options);
  const connectedWalletsObservable = useConnectedWalletsObservable();
  const chainSpecPromise = useChainSpecPromise(options);

  return useLazyValue(
    computed(() => ["accounts", chainId.value]),
    () => getAccounts(connectedWalletsObservable.value, chainSpecPromise.value),
  );
}
