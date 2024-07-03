import { IDLE, type AsyncState, type MutationError } from "@reactive-dot/core";
import { useState } from "react";

export function useAsyncState<TResult, TError extends Error = MutationError>() {
  return useState<AsyncState<TResult, TError>>(IDLE);
}
