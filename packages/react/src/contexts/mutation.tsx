import type { AsyncValue, idle, MutationError } from "@reactive-dot/core";
import type { MutationEvent as BaseMutationEvent } from "@reactive-dot/core/internal.js";
import type { TxEvent } from "polkadot-api";
import { createContext } from "react";
import { Subject } from "rxjs";

export type MutationEvent = BaseMutationEvent & {
  value: Exclude<AsyncValue<TxEvent, MutationError>, typeof idle>;
};

export const MutationEventSubjectContext = createContext(
  new Subject<MutationEvent>(),
);
