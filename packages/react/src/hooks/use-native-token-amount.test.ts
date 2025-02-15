import {
  useNativeTokenAmountFromNumber,
  useNativeTokenAmountFromPlanck,
} from "./use-native-token-amount.js";
import { DenominatedNumber } from "@reactive-dot/utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("react", () => ({
  useMemo: vi.fn((value: (...args: unknown[]) => unknown) => value()),
}));

vi.mock("./use-chain-spec-data", () => ({
  useChainSpecData: vi.fn(() => ({
    properties: {
      tokenDecimals: 12,
      tokenSymbol: "DOT",
    },
  })),
}));

describe("useNativeTokenAmountFromPlanck", () => {
  it("should convert planck value to DenominatedNumber", () => {
    const result = useNativeTokenAmountFromPlanck(1000000000000n);

    expect(result).toBeInstanceOf(DenominatedNumber);
    expect(result.toLocaleString("en-NZ")).toBe("DOT 1.00");
  });

  it("should return conversion function when no planck value provided", () => {
    const converter = useNativeTokenAmountFromPlanck();

    expect(converter).toBeTypeOf("function");

    const result = converter(1000000000000n);

    expect(result).toBeInstanceOf(DenominatedNumber);
    expect(result.toLocaleString("en-NZ")).toBe("DOT 1.00");
  });
});

describe("useNativeTokenAmountFromNumber", () => {
  it("should convert number value to DenominatedNumber", () => {
    const result = useNativeTokenAmountFromNumber(1);

    expect(result).toBeInstanceOf(DenominatedNumber);
    expect(result.toLocaleString("en-NZ")).toBe("DOT 1.00");
  });

  it("should convert string number to DenominatedNumber", () => {
    const result = useNativeTokenAmountFromNumber("1.5");

    expect(result).toBeInstanceOf(DenominatedNumber);
    expect(result.toLocaleString("en-NZ")).toBe("DOT 1.50");
  });

  it("should return conversion function when no number provided", () => {
    const converter = useNativeTokenAmountFromNumber();

    expect(converter).toBeTypeOf("function");

    const result = converter(2);

    expect(result).toBeInstanceOf(DenominatedNumber);
    expect(result.toLocaleString("en-NZ")).toBe("DOT 2.00");
  });
});
