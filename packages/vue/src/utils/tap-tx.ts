import type { MutationEvent } from "../types.js";
import type { ChainId } from "@reactive-dot/core";
import { MutationError } from "@reactive-dot/core";
import type { GenericTransaction } from "@reactive-dot/core/internal.js";
import type { TxEvent } from "polkadot-api";
import { type MonoTypeOperatorFunction, type Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { type Ref } from "vue";

export function tapTx<T extends TxEvent>(
  mutationEventRef: Ref<MutationEvent | undefined>,
  chainId: ChainId,
  transaction: GenericTransaction,
): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    const eventProps = {
      id: globalThis.crypto.randomUUID(),
      chainId,
      call: transaction.decodedCall,
    };

    mutationEventRef.value = { ...eventProps, status: "pending" };

    return source.pipe(
      tap(
        (value) =>
          (mutationEventRef.value = {
            ...eventProps,
            status: "success",
            data: value,
          }),
      ),
      catchError((error) => {
        mutationEventRef.value = {
          ...eventProps,
          status: "error",
          error: MutationError.from(error),
        };
        throw error;
      }),
    );
  };
}
