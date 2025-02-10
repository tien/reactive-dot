import { useAsyncAction } from "./use-async-action.js";
import { idle, MutationError, pending } from "@reactive-dot/core";
import { act, renderHook } from "@testing-library/react";
import { Subject } from "rxjs";
import { expect, it, vi } from "vitest";

it("should handle Promise-based actions", async () => {
  const mockAction = vi.fn().mockResolvedValue("success");
  const { result } = renderHook(() => useAsyncAction(mockAction));

  expect(result.current[0]).toBe(idle);

  await act(async () => {
    result.current[1]();
  });

  expect(mockAction).toHaveBeenCalled();
  expect(result.current[0]).toBe("success");
});

it("should handle Observable-based actions", async () => {
  const subject = new Subject<string>();
  const mockAction = vi.fn().mockReturnValue(subject);
  const { result } = renderHook(() => useAsyncAction(mockAction));

  expect(result.current[0]).toBe(idle);

  act(() => {
    result.current[1]();
  });

  expect(result.current[0]).toBe(pending);

  act(() => {
    subject.next("success");
  });

  expect(result.current[0]).toBe("success");
});

it("should handle synchronous rejection", async () => {
  const error = new Error("test error");
  const mockAction = vi.fn(() => {
    throw error;
  });
  const { result } = renderHook(() => useAsyncAction(mockAction));

  await act(async () => {
    try {
      await result.current[1]();
    } catch {
      /* empty */
    }
  });

  expect(result.current[0]).toBeInstanceOf(MutationError);
  expect((result.current[0] as MutationError).cause).toBe(error);
});

it("should handle Promise rejection", async () => {
  const error = new Error("test error");
  const mockAction = vi.fn().mockRejectedValue(error);
  const { result } = renderHook(() => useAsyncAction(mockAction));

  await act(async () => {
    try {
      await result.current[1]();
    } catch {
      /* empty */
    }
  });

  expect(result.current[0]).toBeInstanceOf(MutationError);
  expect((result.current[0] as MutationError).cause).toBe(error);
});

it("should handle Observable errors", async () => {
  const subject = new Subject<string>();
  const error = new Error("test error");
  const mockAction = vi.fn().mockReturnValue(subject);
  const { result } = renderHook(() => useAsyncAction(mockAction));

  act(() => {
    result.current[1]();
  });

  act(() => {
    subject.error(error);
  });

  expect(result.current[0]).toBeInstanceOf(MutationError);
  expect((result.current[0] as MutationError).cause).toBe(error);
});
