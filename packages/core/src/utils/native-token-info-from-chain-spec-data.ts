import type { ChainSpecData } from "@polkadot-api/substrate-client";

export function nativeTokenInfoFromChainSpecData(chainSpecData: ChainSpecData) {
  const symbol = chainSpecData.properties.tokenSymbol;
  const decimals = chainSpecData.properties.tokenDecimals;

  return {
    code:
      typeof symbol === "string"
        ? symbol
        : Array.isArray(symbol) && typeof symbol[0] === "string"
          ? symbol[0]
          : undefined,
    decimals:
      typeof decimals === "number"
        ? decimals
        : Array.isArray(decimals) && typeof decimals[0] === "number"
          ? decimals[0]
          : undefined,
  };
}
