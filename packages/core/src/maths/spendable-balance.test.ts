import { spendableBalance } from "./spendable-balance";
import { expect, test } from "vitest";

// https://wiki.polkadot.network/docs/learn-account-balances
test.each([
  { free: 100n, frozen: 0n, reserved: 0n, spendable: 99n },
  { free: 100n, frozen: 80n, reserved: 0n, spendable: 20n },
  { free: 80n, frozen: 80n, reserved: 20n, spendable: 20n },
])(
  "$spendable = $free - max($frozen - $reserved, existentialDeposit)",
  ({ free, frozen, reserved, spendable }) => {
    const existentialDeposit = 1n;

    expect(
      spendableBalance({
        free,
        frozen,
        reserved,
        existentialDeposit,
        includesExistentialDeposit: false,
      }),
    ).toBe(spendable);
  },
);
