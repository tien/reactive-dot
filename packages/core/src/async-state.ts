import type { IDLE, PENDING } from "./symbols.js";

export type AsyncState<TResult, TError extends Error> =
  | typeof IDLE
  | typeof PENDING
  | TError
  | TResult;
