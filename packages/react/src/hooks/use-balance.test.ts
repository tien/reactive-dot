import { DenominatedNumber } from "../../../utils/build/denominated-number.js";
import { useSpendableBalance } from "./use-balance.js";
import { useNativeTokenAmountFromPlanck } from "./use-native-token-amount.js";
import { useLazyLoadQuery } from "./use-query.js";
import { idle, Query } from "@reactive-dot/core";
import { renderHook } from "@testing-library/react";
import type { ChainDefinition } from "polkadot-api";
import { expect, it, vi } from "vitest";

vi.mock("./use-query");
vi.mock("./use-native-token-amount");

const free = 1000n;

vi.mocked(useLazyLoadQuery).mockImplementation(
  // @ts-expect-error TODO: fix type
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder: <T extends Query<any[], ChainDefinition>>(
      query: Query<[], ChainDefinition>,
    ) => T,
  ) => {
    if (!builder) {
      return idle;
    }

    const query = builder(new Query());

    if (!query) {
      return idle;
    }

    return query.instructions.map((instruction) => {
      if (
        instruction.instruction === "get-constant" &&
        instruction.pallet === "Balances" &&
        instruction.constant === "ExistentialDeposit"
      ) {
        return 100n;
      } else if (
        instruction.instruction === "read-storage" &&
        instruction.pallet === "System" &&
        instruction.storage === "Account" &&
        "multi" in instruction &&
        instruction.multi
      ) {
        return Array.from({ length: instruction.args.length }).fill({
          nonce: 0,
          consumers: 0,
          providers: 0,
          sufficients: 0,
          data: {
            free,
            reserved: 1000n,
            frozen: 50n,
            flags: 0n,
          },
        });
      } else {
        throw new Error("Invalid instruction");
      }
    });
  },
);

vi.mocked(useNativeTokenAmountFromPlanck).mockReturnValue(
  (planck) => new DenominatedNumber(planck, 0),
);

it("should return spendable balance for single address", () => {
  const { result } = renderHook(() =>
    useSpendableBalance("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"),
  );

  expect(result.current).toBeInstanceOf(DenominatedNumber);
});

it("should return spendable balances array for multiple addresses", () => {
  const { result } = renderHook(() =>
    useSpendableBalance([
      "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    ]),
  );

  expect(result.current).toEqual(
    expect.arrayContaining([
      expect.any(DenominatedNumber),
      expect.any(DenominatedNumber),
    ]),
  );
});

it("should handle includesExistentialDeposit option", () => {
  const { result } = renderHook(() =>
    useSpendableBalance("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", {
      includesExistentialDeposit: false,
    }),
  );

  expect(result.current.planck).toBeLessThan(free);

  const { result: result2 } = renderHook(() =>
    useSpendableBalance("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", {
      includesExistentialDeposit: true,
    }),
  );

  expect(result2.current.planck).toBeGreaterThan(result.current.planck);
});
