export const BigIntMath = Object.freeze({
  min(...values: bigint[]) {
    if (values.length === 0) {
      return 0n;
    }

    return values.reduce((previousValue, currentValue) =>
      currentValue < previousValue ? currentValue : previousValue,
    );
  },
  max(...values: bigint[]) {
    if (values.length === 0) {
      return 0n;
    }

    return values.reduce((previousValue, currentValue) =>
      currentValue > previousValue ? currentValue : previousValue,
    );
  },
  get [Symbol.toStringTag]() {
    return "BigIntMath";
  },
});
