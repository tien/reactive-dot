import { useChainSpecData } from "@reactive-dot/react";
import { DenominatedNumber } from "@reactive-dot/utils";

export const useNativeTokenNumberWithPlanck = (planck: bigint) => {
  const chainSpecData = useChainSpecData();

  return new DenominatedNumber(
    planck,
    chainSpecData.properties.tokenDecimals,
    chainSpecData.properties.tokenSymbol,
  );
};
