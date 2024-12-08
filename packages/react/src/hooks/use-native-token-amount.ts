import type { ChainHookOptions } from "./types.js";
import { useChainSpecData } from "./use-chain-spec-data.js";
import { DenominatedNumber } from "@reactive-dot/utils";
import { useMemo } from "react";

/**
 * Hook for returning the native token amount from a planck value.
 *
 * @param planck - The planck value
 * @param options - Additional options
 * @returns The native token amount
 */
export function useNativeTokenAmountFromPlanck(
  planck: bigint | number | string,
  options?: ChainHookOptions,
): Promise<DenominatedNumber>;
/**
 * Hook for returning a function that converts planck value to native token amount.
 *
 * @param options - Additional options
 * @returns Function for getting the native token amount from a planck value
 */
export function useNativeTokenAmountFromPlanck(
  options?: ChainHookOptions,
): Promise<(planck: bigint | number | string) => DenominatedNumber>;
export function useNativeTokenAmountFromPlanck(
  planckOrOptions?: bigint | number | string | ChainHookOptions,
  maybeOptions?: ChainHookOptions,
): Promise<
  DenominatedNumber | ((planck: bigint | number | string) => DenominatedNumber)
> {
  const options =
    typeof planckOrOptions === "object" ? planckOrOptions : maybeOptions;

  const chainSpecDataPromise = useChainSpecData(options);

  return useMemo(
    () =>
      chainSpecDataPromise.then((chainSpecData) => {
        switch (typeof planckOrOptions) {
          case "bigint":
          case "number":
          case "string":
            return new DenominatedNumber(
              planckOrOptions,
              chainSpecData.properties.tokenDecimals,
              chainSpecData.properties.tokenSymbol,
            );
          default:
            return (planck: bigint | number | string) =>
              new DenominatedNumber(
                planck,
                chainSpecData.properties.tokenDecimals,
                chainSpecData.properties.tokenSymbol,
              );
        }
      }),
    [chainSpecDataPromise, planckOrOptions],
  );
}

/**
 * Hook for returning the native token amount from a number value
 *
 * @param number - The number value
 * @param options - Additional options
 * @returns The native token amount
 */
export function useNativeTokenAmountFromNumber(
  number: number | string,
  options?: ChainHookOptions,
): Promise<DenominatedNumber>;
/**
 * Hook for returning a function that converts number value to native token amount
 *
 * @param options - Additional options
 * @returns Function for getting the native token amount from a number value
 */
export function useNativeTokenAmountFromNumber(
  options?: ChainHookOptions,
): Promise<(number: number | string) => DenominatedNumber>;
export function useNativeTokenAmountFromNumber(
  numberOrOptions?: number | string | ChainHookOptions,
  maybeOptions?: ChainHookOptions,
): Promise<DenominatedNumber | ((planck: number) => DenominatedNumber)> {
  const options =
    typeof numberOrOptions === "object" ? numberOrOptions : maybeOptions;

  const chainSpecDataPromise = useChainSpecData(options);

  return useMemo(
    () =>
      chainSpecDataPromise.then((chainSpecData) => {
        switch (typeof numberOrOptions) {
          case "number":
          case "string":
            return new DenominatedNumber(
              numberOrOptions,
              chainSpecData.properties.tokenDecimals,
              chainSpecData.properties.tokenSymbol,
            );
          default:
            return (number: number | string) =>
              DenominatedNumber.fromNumber(
                number,
                chainSpecData.properties.tokenDecimals,
                chainSpecData.properties.tokenSymbol,
              );
        }
      }),
    [chainSpecDataPromise, numberOrOptions],
  );
}
