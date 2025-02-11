import { useAsyncAction } from "./use-async-action.js";
import { MutationError } from "@reactive-dot/core";
import { from, of, throwError } from "rxjs";
import { expect, it, vi } from "vitest";
import { nextTick } from "vue";

it("should execute a promise-based action and update state", async () => {
  const delay = Promise.withResolvers<void>();

  const action = vi.fn(async (value: string) => {
    await delay.promise;
    return `Result: ${value}`;
  });

  const { execute, data, error, status } = useAsyncAction(action);

  expect(status.value).toBe("idle");
  expect(data.value).toBeUndefined();
  expect(error.value).toBeUndefined();

  const promise = execute("test");

  expect(status.value).toBe("pending");

  delay.resolve();
  await promise;

  expect(action).toHaveBeenCalledWith("test");
  expect(data.value).toBe("Result: test");
  expect(status.value).toBe("success");
  expect(error.value).toBeUndefined();
});

it("should execute an observable-based action and update state", async () => {
  const delay = Promise.withResolvers<void>();

  const action = vi.fn((value: string) =>
    from(delay.promise.then(() => `Result: ${value}`)),
  );
  const { execute, data, error, status } = useAsyncAction(action);

  expect(status.value).toBe("idle");
  expect(data.value).toBeUndefined();
  expect(error.value).toBeUndefined();

  execute("test");

  expect(action).toHaveBeenCalledWith("test");
  expect(status.value).toBe("pending");

  delay.resolve();

  await nextTick();
  await nextTick();

  expect(data.value).toBe("Result: test");
  expect(status.value).toBe("success");
  expect(error.value).toBeUndefined();
});

it("should handle promise rejection and update state", async () => {
  const delay = Promise.withResolvers<void>();

  const action = vi.fn((_: string) => delay.promise);
  const { execute, data, error, status } = useAsyncAction(action);

  expect(status.value).toBe("idle");
  expect(data.value).toBeUndefined();
  expect(error.value).toBeUndefined();

  const testError = new Error();

  delay.reject(testError);

  await expect(() => execute("test")).rejects.toThrow(testError);

  expect(action).toHaveBeenCalledWith("test");
  expect(data.value).toBeUndefined();
  expect(status.value).toBe("error");
  expect(error.value).toBeInstanceOf(MutationError);
  expect((error.value as MutationError).cause).toBe(testError);
});

it("should handle observable error and update state", async () => {
  const testError = new Error();

  const action = vi.fn((_: string) => throwError(() => testError));
  const { execute, data, error, status } = useAsyncAction(action);

  expect(status.value).toBe("idle");
  expect(data.value).toBeUndefined();
  expect(error.value).toBeUndefined();

  execute("test");

  expect(action).toHaveBeenCalledWith("test");
  expect(data.value).toBeUndefined();
  expect(status.value).toBe("error");
  expect(error.value).toBeInstanceOf(MutationError);
  expect((error.value as MutationError).cause).toBe(testError);
});

it("should handle synchronous errors in the action", () => {
  const testError = new Error();
  const action = vi.fn((_: string) => {
    throw testError;
  });
  const { execute, data, error, status } = useAsyncAction(action);

  expect(status.value).toBe("idle");
  expect(data.value).toBeUndefined();
  expect(error.value).toBeUndefined();

  try {
    execute("test");
  } catch {
    /* empty */
  }

  expect(action).toHaveBeenCalledWith("test");
  expect(data.value).toBeUndefined();
  expect(status.value).toBe("error");
  expect(error.value).toBeInstanceOf(MutationError);
  expect((error.value as MutationError).cause).toBe(testError);
});

it("should work with actions that return void promises", async () => {
  const delay = Promise.withResolvers<void>();
  const action = vi.fn(async (_: string) => delay.promise);
  const { execute, data, status } = useAsyncAction(action);

  delay.resolve();
  await execute("test");

  expect(status.value).toBe("success");
  expect(data.value).toBeUndefined();
});

it("should work with actions that return void observables", () => {
  const action = vi.fn((_: string) => of(undefined));
  const { execute, data, status } = useAsyncAction(action);

  execute("test");

  expect(status.value).toBe("success");
  expect(data.value).toBeUndefined();
});
