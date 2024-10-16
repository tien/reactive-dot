import { SignerContext } from "../contexts/index.js";
import { MutationEventSubjectContext } from "../contexts/mutation.js";
import { typedApiAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { useAsyncAction } from "./use-async-action.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import type { ChainId, Chains } from "@reactive-dot/core";
import { MutationError } from "@reactive-dot/core";
import { useAtomCallback } from "jotai/utils";
import type {
  PolkadotSigner,
  Transaction,
  TxObservable,
  TypedApi,
} from "polkadot-api";
import { useCallback, useContext } from "react";
import { from } from "rxjs";
import { tap, switchMap } from "rxjs/operators";

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
    builder: TypedApi<Chains[TChainId]>["tx"],
  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Transaction<any, any, any, any>,
  TChainId extends ChainId,
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
  const config = useConfig();
  const chainId = internal_useChainId(options);
  const mutationEventSubject = useContext(MutationEventSubjectContext);
  const contextSigner = useContext(SignerContext);

  return useAsyncAction(
    useAtomCallback(
      useCallback(
        (
          get,
          _set,
          submitOptions?: TxOptions<ReturnType<TAction>> & {
            signer?: PolkadotSigner;
          },
        ) => {
          const signer =
            submitOptions?.signer ?? options?.signer ?? contextSigner;

          if (signer === undefined) {
            throw new MutationError("No signer provided");
          }

          const id = globalThis.crypto.randomUUID();

          return from(get(typedApiAtomFamily({ config, chainId }))).pipe(
            switchMap((typedApi) => {
              const transaction = action(typedApi.tx);

              return transaction
                .signSubmitAndWatch(signer, submitOptions ?? options?.txOptions)
                .pipe(
                  tap((value) =>
                    mutationEventSubject.next({
                      id,
                      chainId,
                      call: transaction.decodedCall,
                      value,
                    }),
                  ),
                );
            }),
          );
        },
        [
          action,
          chainId,
          config,
          contextSigner,
          mutationEventSubject,
          options?.signer,
          options?.txOptions,
        ],
      ),
    ),
  );
}
