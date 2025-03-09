import { nativeTokenInfoFromChainSpecData } from "./native-token-info-from-chain-spec-data.js";
import type { ChainSpecData } from "@polkadot-api/substrate-client";
import { expect, it } from "vitest";

it("should extract token code and decimals when both are simple values", () => {
  const mockChainSpecData = {
    properties: {
      tokenSymbol: "DOT",
      tokenDecimals: 10,
    },
  } as ChainSpecData;

  const result = nativeTokenInfoFromChainSpecData(mockChainSpecData);

  expect(result).toEqual({ code: "DOT", decimals: 10 });
});

it("should extract token code and decimals from arrays", () => {
  const mockChainSpecData = {
    properties: {
      tokenSymbol: ["DOT", "KSM"],
      tokenDecimals: [10, 12],
    },
  } as ChainSpecData;

  const result = nativeTokenInfoFromChainSpecData(mockChainSpecData);

  expect(result).toEqual({ code: "DOT", decimals: 10 });
});

it("should handle undefined token symbol", () => {
  const mockChainSpecData = {
    properties: {
      tokenDecimals: 10,
    },
  } as ChainSpecData;

  const result = nativeTokenInfoFromChainSpecData(mockChainSpecData);

  expect(result).toEqual({ code: undefined, decimals: 10 });
});

it("should handle undefined token decimals", () => {
  const mockChainSpecData = {
    properties: {
      tokenSymbol: "DOT",
    },
  } as ChainSpecData;

  const result = nativeTokenInfoFromChainSpecData(mockChainSpecData);

  expect(result).toEqual({ code: "DOT", decimals: undefined });
});

it("should handle invalid token symbol type", () => {
  const mockChainSpecData = {
    properties: {
      tokenSymbol: 123,
      tokenDecimals: 10,
    },
  } as ChainSpecData;

  const result = nativeTokenInfoFromChainSpecData(mockChainSpecData);

  expect(result).toEqual({ code: undefined, decimals: 10 });
});

it("should handle invalid token decimals type", () => {
  const mockChainSpecData = {
    properties: {
      tokenSymbol: "DOT",
      tokenDecimals: "10",
    },
  } as ChainSpecData;

  const result = nativeTokenInfoFromChainSpecData(mockChainSpecData);

  expect(result).toEqual({ code: "DOT", decimals: undefined });
});

it("should handle empty arrays", () => {
  const mockChainSpecData = {
    properties: {
      tokenSymbol: [],
      tokenDecimals: [],
    },
  } as ChainSpecData;

  const result = nativeTokenInfoFromChainSpecData(mockChainSpecData);

  expect(result).toEqual({ code: undefined, decimals: undefined });
});

it("should handle arrays with invalid types", () => {
  const mockChainSpecData = {
    properties: {
      tokenSymbol: [123, 456],
      tokenDecimals: ["10", "12"],
    },
  } as ChainSpecData;

  const result = nativeTokenInfoFromChainSpecData(mockChainSpecData);

  expect(result).toEqual({ code: undefined, decimals: undefined });
});
