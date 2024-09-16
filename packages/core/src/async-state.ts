import type { idle, pending } from "./symbols.js";

export type AsyncValue<TResult, TError extends Error = Error> =
  | typeof idle
  | typeof pending
  | TError
  | TResult;
