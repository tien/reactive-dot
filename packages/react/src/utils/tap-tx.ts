import { type MutationEvent } from "../contexts/mutation.js";
import type { ChainId } from "@reactive-dot/core";
import { MutationError, pending } from "@reactive-dot/core";
import type { GenericTransaction } from "@reactive-dot/core/internal.js";
import type { TxEvent } from "polkadot-api";
import {
  type MonoTypeOperatorFunction,
  type Observable,
  type Subject,
} from "rxjs";
import { catchError, tap } from "rxjs/operators";

export function tapTx<T extends TxEvent>(
  mutationEventSubject: Subject<MutationEvent>,
  chainId: ChainId,
  transaction: GenericTransaction,
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    const eventProps = {
      id: globalThis.crypto.randomUUID(),
      chainId,
      call: transaction.decodedCall,
    };

    mutationEventSubject.next({ ...eventProps, value: pending });

    return source.pipe(
      tap((value) => mutationEventSubject.next({ ...eventProps, value })),
      catchError((error) => {
        mutationEventSubject.next({
          ...eventProps,
          value: MutationError.from(error),
        });
        throw error;
      }),
    );
  };
}
