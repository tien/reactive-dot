import { AsyncState, IDLE, MutationError } from "@reactive-dot/core";
import { useState } from "react";

export const useAsyncState = <
  TResult,
  TError extends Error = MutationError,
>() => useState<AsyncState<TResult, TError>>(IDLE);
