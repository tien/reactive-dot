import { DenominatedNumber } from "./denominated-number.js";
import { describe, expect, it, test } from "vitest";

describe("fromPlanck", () => {
  it("leads to correct atomics value", () => {
    expect(new DenominatedNumber("1", 0).planck).toEqual(1n);
    expect(new DenominatedNumber("1", 1).planck).toEqual(1n);
    expect(new DenominatedNumber("1", 2).planck).toEqual(1n);

    expect(new DenominatedNumber("1", 5).planck).toEqual(1n);
    expect(new DenominatedNumber("2", 5).planck).toEqual(2n);
    expect(new DenominatedNumber("3", 5).planck).toEqual(3n);
    expect(new DenominatedNumber("10", 5).planck).toEqual(10n);
    expect(new DenominatedNumber("20", 5).planck).toEqual(20n);
    expect(new DenominatedNumber("30", 5).planck).toEqual(30n);
    expect(new DenominatedNumber("100000000000000000000000", 5).planck).toEqual(
      100000000000000000000000n,
    );
    expect(new DenominatedNumber("200000000000000000000000", 5).planck).toEqual(
      200000000000000000000000n,
    );
    expect(new DenominatedNumber("300000000000000000000000", 5).planck).toEqual(
      300000000000000000000000n,
    );

    expect(new DenominatedNumber("44", 5).planck).toEqual(44n);
    expect(new DenominatedNumber("044", 5).planck).toEqual(44n);
    expect(new DenominatedNumber("0044", 5).planck).toEqual(44n);
    expect(new DenominatedNumber("00044", 5).planck).toEqual(44n);
  });

  it("reads DenominatedNumbers correctly", () => {
    expect(new DenominatedNumber("44", 0).toString()).toEqual("44");
    expect(new DenominatedNumber("44", 1).toString()).toEqual("4.4");
    expect(new DenominatedNumber("44", 2).toString()).toEqual("0.44");
    expect(new DenominatedNumber("44", 3).toString()).toEqual("0.044");
    expect(new DenominatedNumber("44", 4).toString()).toEqual("0.0044");
  });

  it("reads negative integer correctly", () => {
    expect(new DenominatedNumber("-44", 0).toString()).toEqual("-44");
    expect(new DenominatedNumber("-44", 1).toString()).toEqual("-4.4");
  });
});

describe("fromNumber", () => {
  it("throws helpful error message for invalid characters", () => {
    expect(() => DenominatedNumber.fromNumber(" 13", 5)).toThrow(
      /invalid character at position 1/i,
    );
    expect(() => DenominatedNumber.fromNumber("1,3", 5)).toThrow(
      /invalid character at position 2/i,
    );
    expect(() => DenominatedNumber.fromNumber("13-", 5)).toThrow(
      /invalid character at position 3/i,
    );
    expect(() => DenominatedNumber.fromNumber("13/", 5)).toThrow(
      /invalid character at position 3/i,
    );
    expect(() => DenominatedNumber.fromNumber("13\\", 5)).toThrow(
      /invalid character at position 3/i,
    );
  });

  it("throws for more than one separator", () => {
    expect(() => DenominatedNumber.fromNumber("1.3.5", 5)).toThrow(
      /more than one separator found/i,
    );
    expect(() => DenominatedNumber.fromNumber("1..3", 5)).toThrow(
      /more than one separator found/i,
    );
    expect(() => DenominatedNumber.fromNumber("..", 5)).toThrow(
      /more than one separator found/i,
    );
  });

  it("throws for separator only", () => {
    expect(() => DenominatedNumber.fromNumber(".", 5)).toThrow(
      /fractional part missing/i,
    );
  });

  it.skip("throws for more decimals than supported", () => {
    expect(() => DenominatedNumber.fromNumber("44.123456", 5)).toThrow(
      /got more DenominatedNumbers than supported/i,
    );
    expect(() => DenominatedNumber.fromNumber("44.1", 0)).toThrow(
      /got more DenominatedNumbers than supported/i,
    );
  });

  it("throws for decimals that are not non-negative integers", () => {
    // no integer
    expect(() => DenominatedNumber.fromNumber("1", Number.NaN)).toThrow(
      /Decimals is not an integer/i,
    );
    expect(() =>
      DenominatedNumber.fromNumber("1", Number.POSITIVE_INFINITY),
    ).toThrow(/Decimals is not an integer/i);
    expect(() =>
      DenominatedNumber.fromNumber("1", Number.NEGATIVE_INFINITY),
    ).toThrow(/Decimals is not an integer/i);
    expect(() => DenominatedNumber.fromNumber("1", 1.78945544484)).toThrow(
      /Decimals is not an integer/i,
    );

    // negative
    expect(() => DenominatedNumber.fromNumber("1", -1)).toThrow(
      /Decimals must not be negative/i,
    );
    expect(() =>
      DenominatedNumber.fromNumber("1", Number.MIN_SAFE_INTEGER),
    ).toThrow(/Decimals must not be negative/i);

    // exceeds supported range
    expect(() => DenominatedNumber.fromNumber("1", 101)).toThrow(
      /Decimals must not exceed 100/i,
    );
  });

  it("returns correct value", () => {
    expect(DenominatedNumber.fromNumber("44", 0).planck).toEqual(44n);
    expect(DenominatedNumber.fromNumber("44", 1).planck).toEqual(440n);
    expect(DenominatedNumber.fromNumber("44", 2).planck).toEqual(4400n);
    expect(DenominatedNumber.fromNumber("44", 3).planck).toEqual(44000n);

    expect(DenominatedNumber.fromNumber("44.2", 1).planck).toEqual(442n);
    expect(DenominatedNumber.fromNumber("44.2", 2).planck).toEqual(4420n);
    expect(DenominatedNumber.fromNumber("44.2", 3).planck).toEqual(44200n);

    expect(DenominatedNumber.fromNumber("44.1", 6).planck).toEqual(44100000n);
    expect(DenominatedNumber.fromNumber("44.12", 6).planck).toEqual(44120000n);
    expect(DenominatedNumber.fromNumber("44.123", 6).planck).toEqual(44123000n);
    expect(DenominatedNumber.fromNumber("44.1234", 6).planck).toEqual(
      44123400n,
    );
    expect(DenominatedNumber.fromNumber("44.12345", 6).planck).toEqual(
      44123450n,
    );
    expect(DenominatedNumber.fromNumber("44.123456", 6).planck).toEqual(
      44123456n,
    );
  });

  it("cuts leading zeros", () => {
    expect(DenominatedNumber.fromNumber("4", 2).planck).toEqual(400n);
    expect(DenominatedNumber.fromNumber("04", 2).planck).toEqual(400n);
    expect(DenominatedNumber.fromNumber("004", 2).planck).toEqual(400n);
  });

  it("cuts tailing zeros", () => {
    expect(DenominatedNumber.fromNumber("4.12", 5).planck).toEqual(412000n);
    expect(DenominatedNumber.fromNumber("4.120", 5).planck).toEqual(412000n);
    expect(DenominatedNumber.fromNumber("4.1200", 5).planck).toEqual(412000n);
    expect(DenominatedNumber.fromNumber("4.12000", 5).planck).toEqual(412000n);
    expect(DenominatedNumber.fromNumber("4.120000", 5).planck).toEqual(412000n);
    expect(DenominatedNumber.fromNumber("4.1200000", 5).planck).toEqual(
      412000n,
    );
  });

  it("interprets the empty string as zero", () => {
    expect(DenominatedNumber.fromNumber("", 0).planck).toEqual(0n);
    expect(DenominatedNumber.fromNumber("", 1).planck).toEqual(0n);
    expect(DenominatedNumber.fromNumber("", 2).planck).toEqual(0n);
    expect(DenominatedNumber.fromNumber("", 3).planck).toEqual(0n);
  });

  it("accepts american notation with skipped leading zero", () => {
    expect(DenominatedNumber.fromNumber(".1", 3).planck).toEqual(100n);
    expect(DenominatedNumber.fromNumber(".12", 3).planck).toEqual(120n);
    expect(DenominatedNumber.fromNumber(".123", 3).planck).toEqual(123n);
  });
});

describe("toString", () => {
  it("displays no decimals point for full numbers", () => {
    expect(DenominatedNumber.fromNumber("44", 0).toString()).toEqual("44");
    expect(DenominatedNumber.fromNumber("44", 1).toString()).toEqual("44");
    expect(DenominatedNumber.fromNumber("44", 2).toString()).toEqual("44");

    expect(DenominatedNumber.fromNumber("44", 2).toString()).toEqual("44");
    expect(DenominatedNumber.fromNumber("44.0", 2).toString()).toEqual("44");
    expect(DenominatedNumber.fromNumber("44.00", 2).toString()).toEqual("44");
    expect(DenominatedNumber.fromNumber("44.000", 2).toString()).toEqual("44");
  });

  it("only shows significant digits", () => {
    expect(DenominatedNumber.fromNumber("44.1", 2).toString()).toEqual("44.1");
    expect(DenominatedNumber.fromNumber("44.10", 2).toString()).toEqual("44.1");
    expect(DenominatedNumber.fromNumber("44.100", 2).toString()).toEqual(
      "44.1",
    );
  });

  it("fills up leading zeros", () => {
    expect(new DenominatedNumber("3", 0).toString()).toEqual("3");
    expect(new DenominatedNumber("3", 1).toString()).toEqual("0.3");
    expect(new DenominatedNumber("3", 2).toString()).toEqual("0.03");
    expect(new DenominatedNumber("3", 3).toString()).toEqual("0.003");
  });

  it("handles zero value", () => {
    expect(new DenominatedNumber(0, 18).toString()).toEqual("0");
  });
});

describe("toNumber", () => {
  it("works", () => {
    expect(DenominatedNumber.fromNumber("0", 5).valueOf()).toEqual(0);
    expect(DenominatedNumber.fromNumber("1", 5).valueOf()).toEqual(1);
    expect(DenominatedNumber.fromNumber("1.5", 5).valueOf()).toEqual(1.5);
    expect(DenominatedNumber.fromNumber("0.1", 5).valueOf()).toEqual(0.1);

    expect(
      DenominatedNumber.fromNumber("1234500000000000", 5).valueOf(),
    ).toEqual(1.2345e15);
    expect(
      DenominatedNumber.fromNumber("1234500000000000.002", 5).valueOf(),
    ).toEqual(1.2345e15);
  });
});

describe("toLocaleString", () => {
  it("acts like normal number when denominator is omitted", () => {
    const string = new DenominatedNumber(30, 0).toLocaleString("en-NZ");

    expect(string).toBe((30).toLocaleString("en-NZ"));
  });

  it("add denomination to the string value", () => {
    const string = new DenominatedNumber(30, 0, "DOT").toLocaleString("en-NZ");

    expect(string).toContain("DOT");
    expect(string).toContain("30.00");
  });

  it("keep compact notation", () => {
    const string = new DenominatedNumber(30000, 0, "DOT").toLocaleString(
      "en-NZ",
      { notation: "compact" },
    );

    expect(string).toContain("DOT");
    expect(string).toContain("30K");
  });
});

test("mapPlanck", () => {
  const number = new DenominatedNumber(30, 0, "DOT").mapPlanck(
    (planck) => planck * 2n,
  );

  expect(number.toString()).toEqual("60");
});

test("mapNumber", () => {
  const number = new DenominatedNumber(30, 0, "DOT").mapNumber(
    (number) => number * 2,
  );

  expect(number.toString()).toEqual("60");
});
