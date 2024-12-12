import { SignerContext } from "../contexts/index.js";
import { MutationEventSubjectContext } from "../contexts/mutation.js";
import type { ChainHookOptions } from "./types.js";
import { useAsyncAction } from "./use-async-action.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useTypedApi } from "./use-typed-api.js";
import type { ChainId } from "@reactive-dot/core";
import { MutationError, pending } from "@reactive-dot/core";
import type { ChainDescriptorOf } from "@reactive-dot/core/internal.js";
import type {
  PolkadotSigner,
  Transaction,
  TxObservable,
  TypedApi,
} from "polkadot-api";
import { useCallback, useContext } from "react";
import { catchError, tap } from "rxjs/operators";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxOptions<T extends Transaction<any, any, any, any>> = Parameters<
  TxObservable<
    T extends Transaction<infer _Args, infer _Pallet, infer _Tx, infer Asset>
      ? Asset
      : void
  >
>[1];

/**
 * Hook for sending transactions to chains.
 *
 * @param action - The function to create the transaction
 * @param options - Additional options
 * @returns The current transaction state & submit function
 */
export function useMutation<
  TAction extends (
    builder: TypedApi<ChainDescriptorOf<TChainId>>["tx"],
  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Transaction<any, any, any, any>,
  TChainId extends ChainId | undefined,
>(
  action: TAction,
  options?: ChainHookOptions<TChainId> & {
    /**
     * Override default signer
     */
    signer?: PolkadotSigner;
    /**
     * Additional transaction options
     */
    txOptions?: TxOptions<ReturnType<TAction>>;
  },
) {
  const chainId = internal_useChainId(options);
  const typedApi = useTypedApi(options);
  const mutationEventSubject = useContext(MutationEventSubjectContext);
  const contextSigner = useContext(SignerContext);

  return useAsyncAction(
    useCallback(
      (submitOptions?: {
        signer?: PolkadotSigner;
        txOptions?: TxOptions<ReturnType<TAction>>;
      }) => {
        const signer =
          submitOptions?.signer ?? options?.signer ?? contextSigner;

        if (signer === undefined) {
          throw new MutationError("No signer provided");
        }

        const id = globalThis.crypto.randomUUID();

        const transaction = action(typedApi.tx);

        const eventProps = { id, chainId, call: transaction.decodedCall };

        mutationEventSubject.next({ ...eventProps, value: pending });

        return transaction
          .signSubmitAndWatch(
            signer,
            submitOptions?.txOptions ?? options?.txOptions,
          )
          .pipe(
            tap((value) => mutationEventSubject.next({ ...eventProps, value })),
            catchError((error) => {
              mutationEventSubject.next({
                ...eventProps,
                value: MutationError.from(error),
              });
              throw error;
            }),
          );
      },
      [
        action,
        chainId,
        contextSigner,
        mutationEventSubject,
        options?.signer,
        options?.txOptions,
        typedApi.tx,
      ],
    ),
  );
}
