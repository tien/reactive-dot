import { ReactiveDotError, QueryError, MutationError } from "./errors.js";
import { describe, it, expect } from "vitest";

describe("ReactiveDotError", () => {
  it("should create error with message", () => {
    const error = new ReactiveDotError("test error");

    expect(error.message).toBe("test error");
    expect(error).toBeInstanceOf(Error);
  });

  it("should create error from another error", () => {
    const originalError = new Error("original error");
    const error = ReactiveDotError.from(originalError, "wrapped error");

    expect(error.message).toBe("wrapped error");
    expect(error.cause).toBe(originalError);
  });
});

describe("QueryError", () => {
  it("should extend ReactiveDotError", () => {
    const error = new QueryError("query error");

    expect(error).toBeInstanceOf(ReactiveDotError);
    expect(error.message).toBe("query error");
  });
});

describe("MutationError", () => {
  it("should extend ReactiveDotError", () => {
    const error = new MutationError("mutation error");

    expect(error).toBeInstanceOf(ReactiveDotError);
    expect(error.message).toBe("mutation error");
  });
});
