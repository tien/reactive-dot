import { IDLE, type AsyncValue, type MutationError } from "@reactive-dot/core";
import { useState } from "react";

export function useAsyncState<TResult, TError extends Error = MutationError>() {
  return useState<AsyncValue<TResult, TError>>(IDLE);
}
