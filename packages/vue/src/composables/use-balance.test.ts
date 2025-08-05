import { DenominatedNumber } from "../../../utils/build/denominated-number.js";
import { chainIdKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useSpendableBalance, useSpendableBalances } from "./use-balance.js";
import { useNativeTokenPromise } from "./use-native-token.js";
import { useQueryObservable } from "./use-query.js";
import { Query } from "@reactive-dot/core";
import type { ChainDefinition } from "polkadot-api";
import { of } from "rxjs";
import { expect, it, vi } from "vitest";
import { computed } from "vue";

vi.mock("./use-query");
vi.mock("./use-native-token");

const free = 1000n;

vi.mocked(useQueryObservable).mockImplementation(
  // @ts-expect-error TODO: fix type
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    builder: <T extends Query<any[], ChainDefinition>>(
      query: Query<[], ChainDefinition>,
    ) => T,
  ) => {
    const query = builder(new Query());

    const result = query.instructions.map((instruction) => {
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

    return computed(() => of(result));
  },
);

vi.mocked(useNativeTokenPromise).mockImplementation(() =>
  // @ts-expect-error TODO: fix type
  computed(() =>
    Promise.resolve({
      amountFromPlanck: (planck: bigint) => new DenominatedNumber(planck, 0),
    }),
  ),
);

it("should return spendable balance for single address", async () => {
  const { result } = withSetup(
    () =>
      useSpendableBalance("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"),
    { [chainIdKey]: "test-chain-id" },
  );

  expect((await result).data.value).toBeInstanceOf(DenominatedNumber);
});

it("should return spendable balances array for multiple addresses", async () => {
  const { result } = withSetup(
    () =>
      useSpendableBalances([
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      ]),
    { [chainIdKey]: "test-chain-id" },
  );

  expect((await result).data.value).toEqual(
    expect.arrayContaining([
      expect.any(DenominatedNumber),
      expect.any(DenominatedNumber),
    ]),
  );
});

it("should return spendable balances array for an array of one address", async () => {
  const { result } = withSetup(
    () =>
      useSpendableBalances([
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      ]),
    { [chainIdKey]: "test-chain-id" },
  );

  expect((await result).data.value).toEqual(
    expect.arrayContaining([expect.any(DenominatedNumber)]),
  );
});

it("should handle includesExistentialDeposit option", async () => {
  const { result } = withSetup(
    () =>
      useSpendableBalance("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", {
        includesExistentialDeposit: false,
      }),
    { [chainIdKey]: "test-chain-id" },
  );

  const data1 = (await result).data;

  expect(data1.value.planck).toBeLessThan(free);

  const { result: result2 } = withSetup(
    () =>
      useSpendableBalance("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", {
        includesExistentialDeposit: true,
      }),
    { [chainIdKey]: "test-chain-id" },
  );

  const data2 = (await result2).data;

  expect(data2.value.planck).toBeGreaterThan(data1.value.planck);
});
