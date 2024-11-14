---
sidebar_position: 2
---

# Number utility

## Denominated number

To handle complexity around [planck unit](https://wiki.polkadot.network/docs/learn-DOT#the-planck-unit) used in Polkadot, a utility class [`DenominatedNumber`](/api/utils/class/DenominatedNumber) is provided by [`@reactive-dot/utils`](https://reactivedot.dev/api/utils).

```ts
import { DenominatedNumber } from "@reactive-dot/utils";

// Denominated numbers are created with a planck value and a decimal places number

const numberFromPlanck = new DenominatedNumber(10_000_000_000n, 10);

console.log(numberFromPlanck.valueOf()); // 10

// Denominated number can also be created from number instead of planck

const numberFromNumber = DenominatedNumber.fromNumber(10, 10);

console.log(numberFromNumber.planck); // 10000000000n

// A string denomination can optionally be added for locale string conversion capability

const numberWithDenomination = DenominatedNumber.fromNumber(10, 10, "DOT");

console.log(numberWithDenomination.toLocaleString("en-NZ")); // DOT 10.00

console.log(numberWithDenomination.toLocaleString("de-DE")); // 10,00 DOT

// Arithmetics

let dotAmount = DenominatedNumber.fromNumber(10, 10, "DOT");

// Arithmetic operations can be performed using the number's planck value

dotAmount = dotAmount.mapFromPlanck((planck) => planck + 5_000_000_000n);

console.log(dotAmount.toLocaleString()); // DOT 10.50

// Arithmetic operations can also be carried out with the number value
// instead of planck if possible lost of precision is acceptable

dotAmount = dotAmount.mapFromNumber((number) => (number * 2) / 4);

console.log(dotAmount.toLocaleString()); // DOT 5.25
```

## Native token

Two hooks [`useNativeTokenAmountFromPlanck`](/api/react/function/useNativeTokenAmountFromPlanck) & [`useNativeTokenAmountFromNumber`](/api/react/function/useNativeTokenAmountFromNumber) are also provided for easy conversion from planck and/or number value to native token amount.

```ts
import {
  useNativeTokenAmountFromNumber,
  useNativeTokenAmountFromPlanck,
} from "@reactive-dot/react";

let amount = useNativeTokenAmountFromPlanck(10_000_000_000n);
// Or
amount = useNativeTokenAmountFromNumber(1);

console.log(amount.toLocaleString("en-NZ")); // DOT 1.00

// Partial application is also supported by omitting the planck/number value.
// Here, a conversion function will be returned instead.
const amountFromPlanck = useNativeTokenAmountFromPlanck();

[10_000_000_000n, 20_000_000_000n, 30_000_000_000n]
  .map(amountFromPlanck)
  .map((amount) => amount.toLocaleString("en-NZ"))
  .forEach(console.log);
// DOT 1.00
// DOT 2.00
// DOT 3.00
```

## Spendable balance

The [`useSpendableBalance`](/api/react/function/useSpendableBalance) hook can be used to get the [spendable balance](https://wiki.polkadot.network/docs/learn-account-balances) of an account(s).

```ts
import { useSpendableBalance } from "@reactive-dot/react";

const spendableBalance = useSpendableBalance(ACCOUNT_ADDRESS);

console.log(spendableBalance.toLocaleString("en-NZ")); // DOT 10.00

const spendableBalances = useSpendableBalance([
  ACCOUNT_ADDRESS_1,
  ACCOUNT_ADDRESS_2,
  ACCOUNT_ADDRESS_3,
]);

console.log(
  spendableBalances.map((balance) => balance.toLocaleString("en-NZ")),
); // ["DOT 10.00", "DOT 20.00", "DOT 30.00"]
```
