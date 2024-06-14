---
sidebar_position: 5
---

# Number utility

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
