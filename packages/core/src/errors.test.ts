import { BaseError, QueryError, MutationError } from "./errors.js";
import { describe, it, expect } from "vitest";

describe("BaseError", () => {
  it("should create error with message", () => {
    const error = new BaseError("test error");

    expect(error.message).toBe("test error");
    expect(error).toBeInstanceOf(Error);
  });

  it("should create error from another error", () => {
    const originalError = new Error("original error");
    const error = BaseError.from(originalError, "wrapped error");

    expect(error.message).toBe("wrapped error");
    expect(error.cause).toBe(originalError);
  });

  it("should reuse message from another error", () => {
    const originalError = new Error("original error");
    const error = BaseError.from(originalError);

    expect(error.message).toBe("original error");
    expect(error.cause).toBe(originalError);
  });
});

describe("QueryError", () => {
  it("should extend BaseError", () => {
    const error = new QueryError("query error");

    expect(error).toBeInstanceOf(BaseError);
    expect(error.message).toBe("query error");
  });
});

describe("MutationError", () => {
  it("should extend BaseError", () => {
    const error = new MutationError("mutation error");

    expect(error).toBeInstanceOf(BaseError);
    expect(error.message).toBe("mutation error");
  });
});
