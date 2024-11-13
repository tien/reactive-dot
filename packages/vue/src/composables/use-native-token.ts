import type { ChainComposableOptions } from "../types.js";
import { useAsyncData } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useChainSpecDataPromise } from "./use-chain-spec-data.js";
import { useLazyValue } from "./use-lazy-value.js";
import { DenominatedNumber } from "@reactive-dot/utils";
import { computed } from "vue";

/**
 * Composable for getting the chain's native token
 * @param options - Additional options
 * @returns The chain's native token
 */
export function useNativeToken(options?: ChainComposableOptions) {
  return useAsyncData(useNativeTokenPromise(options));
}

/**
 * @internal
 */
export function useNativeTokenPromise(options?: ChainComposableOptions) {
  const chainId = internal_useChainId(options);
  const chainSpecDataPromise = useChainSpecDataPromise(options);

  return useLazyValue(
    computed(() => ["native-token", chainId.value]),
    () =>
      chainSpecDataPromise.value.then((chainSpecData) => ({
        symbol: chainSpecData.properties.tokenSymbol as string,
        decimals: chainSpecData.properties.tokenDecimals as number,
        amountFromPlanck: (planck: bigint | number | string) =>
          new DenominatedNumber(
            planck,
            chainSpecData.properties.tokenDecimals,
            chainSpecData.properties.tokenSymbol,
          ),
        amountFromNumber: (number: number | string) =>
          DenominatedNumber.fromNumber(
            number,
            chainSpecData.properties.tokenDecimals,
            chainSpecData.properties.tokenSymbol,
          ),
      })),
  );
}
