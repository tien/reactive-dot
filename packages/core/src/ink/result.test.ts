import { unwrapResult } from "./result.js";
import { describe, it, expect } from "vitest";

describe("unwrapResult", () => {
  it("should return the value for a successful result", () => {
    const result = { success: true, value: 42 };
    const output = unwrapResult(result);
    expect(output).toBe(42);
  });

  it("should throw an error for a failed result", () => {
    const errorInfo = { type: "CustomError", value: "Failure cause" };
    const result = { success: false, value: errorInfo };

    expect(() => unwrapResult(result)).toThrow("CustomError");

    try {
      unwrapResult(result);
    } catch (error: unknown) {
      expect((error as Error).cause).toEqual("Failure cause");
    }
  });

  it("should return the original value if it is not a Result", () => {
    const notAResultNumber = 100;
    const notAResultString = "hello";
    const notAResultObject = { foo: "bar" };

    expect(unwrapResult(notAResultNumber)).toBe(100);
    expect(unwrapResult(notAResultString)).toBe("hello");
    expect(unwrapResult(notAResultObject)).toEqual(notAResultObject);
  });
});
