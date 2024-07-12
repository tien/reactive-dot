import type { IDLE, PENDING } from "./symbols.js";

export type AsyncValue<TResult, TError extends Error = Error> =
  | typeof IDLE
  | typeof PENDING
  | TError
  | TResult;
