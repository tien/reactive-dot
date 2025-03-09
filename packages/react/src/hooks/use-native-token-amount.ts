import type { ChainHookOptions } from "./types.js";
import { useChainSpecData } from "./use-chain-spec-data.js";
import { nativeTokenInfoFromChainSpecData } from "@reactive-dot/core/internal.js";
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
): DenominatedNumber;
/**
 * Hook for returning a function that converts planck value to native token amount.
 *
 * @param options - Additional options
 * @returns Function for getting the native token amount from a planck value
 */
export function useNativeTokenAmountFromPlanck(
  options?: ChainHookOptions,
): (planck: bigint | number | string) => DenominatedNumber;
export function useNativeTokenAmountFromPlanck(
  planckOrOptions?: bigint | number | string | ChainHookOptions,
  maybeOptions?: ChainHookOptions,
):
  | DenominatedNumber
  | ((planck: bigint | number | string) => DenominatedNumber) {
  const options =
    typeof planckOrOptions === "object" ? planckOrOptions : maybeOptions;

  const chainSpecData = useChainSpecData(options);
  const nativeTokenInfo = useMemo(
    () => nativeTokenInfoFromChainSpecData(chainSpecData),
    [chainSpecData],
  );

  return useMemo(
    () => {
      switch (typeof planckOrOptions) {
        case "bigint":
        case "number":
        case "string":
          return new DenominatedNumber(
            planckOrOptions,
            nativeTokenInfo.decimals ?? 0,
            nativeTokenInfo.code,
          );
        default:
          return (planck: bigint | number | string) =>
            new DenominatedNumber(
              planck,
              nativeTokenInfo.decimals ?? 0,
              nativeTokenInfo.code,
            );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nativeTokenInfo.code, nativeTokenInfo.decimals, typeof planckOrOptions],
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
): DenominatedNumber;
/**
 * Hook for returning a function that converts number value to native token amount
 *
 * @param options - Additional options
 * @returns Function for getting the native token amount from a number value
 */
export function useNativeTokenAmountFromNumber(
  options?: ChainHookOptions,
): (number: number | string) => DenominatedNumber;
export function useNativeTokenAmountFromNumber(
  numberOrOptions?: number | string | ChainHookOptions,
  maybeOptions?: ChainHookOptions,
): DenominatedNumber | ((planck: number) => DenominatedNumber) {
  const options =
    typeof numberOrOptions === "object" ? numberOrOptions : maybeOptions;

  const chainSpecData = useChainSpecData(options);
  const nativeTokenInfo = useMemo(
    () => nativeTokenInfoFromChainSpecData(chainSpecData),
    [chainSpecData],
  );

  return useMemo(
    () => {
      switch (typeof numberOrOptions) {
        case "number":
        case "string":
          return DenominatedNumber.fromNumber(
            numberOrOptions,
            nativeTokenInfo.decimals ?? 0,
            nativeTokenInfo.code,
          );
        default:
          return (number: number | string) =>
            DenominatedNumber.fromNumber(
              number,
              nativeTokenInfo.decimals ?? 0,
              nativeTokenInfo.code,
            );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nativeTokenInfo.code, nativeTokenInfo.decimals, typeof numberOrOptions],
  );
}
