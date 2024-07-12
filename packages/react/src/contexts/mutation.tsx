import type {
  AsyncValue,
  ChainId,
  IDLE,
  MutationError,
} from "@reactive-dot/core";
import type { Transaction, TxEvent } from "polkadot-api";
import { createContext } from "react";
import { Subject } from "rxjs";

export type MutationEvent = {
  id: `${string}-${string}-${string}-${string}-${string}`;
  chainId: ChainId;
  call?: Transaction<
    NonNullable<unknown>,
    string,
    string,
    unknown
  >["decodedCall"];
  value: Exclude<AsyncValue<TxEvent, MutationError>, typeof IDLE>;
};

export const MutationEventSubjectContext = createContext(
  new Subject<MutationEvent>(),
);
