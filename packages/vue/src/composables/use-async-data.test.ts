import { useAsyncData } from "./use-async-data.js";
import { lazyValue } from "./use-lazy-value.js";
import { Subject } from "rxjs";
import { expect, it } from "vitest";
import { nextTick } from "vue";

it("should handle Promise success", async () => {
  const value = "test";
  const promise = Promise.resolve(value);
  const result = useAsyncData(lazyValue([""], () => promise, new Map()));

  expect(result.status.value).toBe("pending");

  await promise;
  await nextTick();

  expect(result.status.value).toBe("success");
  expect(result.data.value).toBe(value);
  expect(result.error.value).toBeUndefined();
});

it("should handle Promise error", async () => {
  const error = new Error("test error");
  const promise = Promise.reject(error);
  const result = useAsyncData(lazyValue([""], () => promise, new Map()));

  expect(result.status.value).toBe("pending");

  await expect(() => promise).rejects.toThrow(error);
  await expect(() => result).rejects.toThrow(error);

  expect(result.status.value).toBe("error");
  expect(result.error.value).toBe(error);
  expect(result.data.value).toBeUndefined();
});

it("should handle Observable values", async () => {
  const subject = new Subject<string>();
  const result = useAsyncData(lazyValue([""], () => subject, new Map()));

  expect(result.status.value).toBe("pending");

  subject.next("test");

  expect(result.status.value).toBe("success");
  expect(result.data.value).toBe("test");

  const error = new Error("test error");

  subject.error(error);

  await expect(() => result).rejects.toThrow(error);

  expect(result.status.value).toBe("error");
  expect(result.error.value).toBe(error);
});

it("should implement PromiseLike interface", async () => {
  const value = "test";
  const promise = Promise.resolve(value);
  const result = useAsyncData(lazyValue([""], () => promise, new Map()));

  expect(result).toHaveProperty("then");

  const resolved = await result;

  expect(resolved.data.value).toBe(value);
});

it("should handle falsy values", () => {
  const result = useAsyncData(lazyValue([""], () => null, new Map()));

  expect(result.status.value).toBe("idle");
  expect(result.data.value).toBeUndefined();
  expect(result.error.value).toBeUndefined();
});
