export class DenominatedNumber extends Number {
  // Large values lead to massive memory usage. Limit to something sensible.
  static #maxDecimal = 100;

  readonly planck: bigint;

  constructor(
    planck: bigint | boolean | number | string,
    readonly decimals: number,
    readonly denomination?: string,
  ) {
    super();
    this.planck = BigInt(planck);
  }

  static fromNumber(
    number: number | string,
    decimals: number,
    denomination?: string,
  ) {
    DenominatedNumber.#verifyDecimals(decimals);

    const numberString = number.toString();

    const badCharacter = numberString.match(/[^0-9.]/);
    if (badCharacter) {
      throw new Error(
        `Invalid character at position ${(badCharacter.index ?? 0) + 1}`,
      );
    }

    let whole: string;
    let fractional: string;

    if (numberString.search(/\./) === -1) {
      // integer format, no separator
      whole = numberString;
      fractional = "";
    } else {
      const parts = numberString.split(".");
      switch (parts.length) {
        case 0:
        case 1:
          throw new Error(
            "Fewer than two elements in split result. This must not happen here.",
          );
        case 2:
          if (!parts[1]) throw new Error("Fractional part missing");

          whole = parts[0]!;
          fractional = parts[1].replace(/0+$/, "");
          break;
        default:
          throw new Error("More than one separator found");
      }
    }

    if (fractional.length > decimals) {
      fractional = fractional.slice(0, decimals);
    }

    const quantity = `${whole}${fractional.padEnd(decimals, "0")}`;

    return new DenominatedNumber(BigInt(quantity), decimals, denomination);
  }

  override valueOf() {
    return Number(this.toString());
  }

  override toString() {
    const paddedPlanck = this.planck.toString().padStart(this.decimals, "0");
    const whole = paddedPlanck
      .slice(0, paddedPlanck.length - this.decimals)
      .padStart(1, "0");
    const fractional = paddedPlanck
      .slice(paddedPlanck.length - this.decimals)
      .replace(/0+$/, "");

    if (fractional.length === 0) {
      return whole;
    } else {
      return `${whole || "0"}.${fractional}`;
    }
  }

  override toLocaleString(
    locales?: string | string[] | undefined,
    options?: Intl.NumberFormatOptions | undefined,
  ): string;
  override toLocaleString(
    locales?: Intl.LocalesArgument,
    options?: Intl.NumberFormatOptions | undefined,
  ): string;
  override toLocaleString(
    locales?: Intl.LocalesArgument | string | string[] | undefined,
    options?: Intl.NumberFormatOptions | undefined,
  ) {
    if (this.denomination === undefined) {
      return this.valueOf().toLocaleString(locales, options);
    }

    const newOptions: Intl.NumberFormatOptions = options ?? {};

    if (options?.style === undefined) {
      newOptions.style = "currency";
      newOptions.currency = "XTS";
    }

    return this.valueOf()
      .toLocaleString(locales, newOptions)
      .replace("XTS", this.denomination);
  }

  mapPlanck(mapper: (planck: bigint) => bigint) {
    return new DenominatedNumber(
      mapper(this.planck),
      this.decimals,
      this.denomination,
    );
  }

  /**
   * @deprecated Use {@link DenominatedNumber.mapPlanck} instead.
   */
  mapFromPlanck = this.mapPlanck;

  mapNumber(mapper: (number: number) => number) {
    return DenominatedNumber.fromNumber(
      mapper(this.valueOf()),
      this.decimals,
      this.denomination,
    );
  }

  /**
   * @deprecated Use {@link DenominatedNumber.mapNumber} instead.
   */
  mapFromNumber = this.mapNumber;

  static #verifyDecimals(fractionalDigits: number): void {
    if (!Number.isInteger(fractionalDigits))
      throw new Error("Decimals is not an integer");
    if (fractionalDigits < 0) throw new Error("Decimals must not be negative");
    if (fractionalDigits > DenominatedNumber.#maxDecimal) {
      throw new Error(
        `Decimals must not exceed ${DenominatedNumber.#maxDecimal}`,
      );
    }
  }
}
