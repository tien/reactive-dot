import { SignerContext } from "../contexts/index.js";
import {
  type MutationEvent,
  MutationEventSubjectContext,
} from "../contexts/mutation.js";
import { typedApiAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { useAsyncState } from "./use-async-state.js";
import { useChainId } from "./use-chain-id.js";
import type { ChainId, Chains } from "@reactive-dot/core";
import { MutationError, PENDING } from "@reactive-dot/core";
import { useAtomCallback } from "jotai/utils";
import type {
  PolkadotSigner,
  Transaction,
  TxEvent,
  TxObservable,
  TypedApi,
} from "polkadot-api";
import { useCallback, useContext } from "react";

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
  const chainId = useChainId(options);
  const mutationEventSubject = useContext(MutationEventSubjectContext);
  const contextSigner = useContext(SignerContext);

  const [event, setEvent] = useAsyncState<TxEvent>();

  const setState = useCallback(
    (event: Omit<MutationEvent, "chainId">) => {
      setEvent(event.value);
      mutationEventSubject.next({ ...event, chainId });
    },
    [chainId, mutationEventSubject, setEvent],
  );

  const submit = useAtomCallback<
    void,
    [options?: TxOptions<ReturnType<TAction>> & { signer: PolkadotSigner }]
  >(
    useCallback(
      async (get, _set, submitOptions) => {
        const id = globalThis.crypto.randomUUID();

        setState({ id, value: PENDING });

        const signer =
          submitOptions?.signer ?? options?.signer ?? contextSigner;

        if (signer === undefined) {
          const error = new MutationError("No signer provided");

          setState({
            id,
            value: MutationError.from(error),
          });

          throw error;
        }

        const api = await get(typedApiAtomFamily(chainId));

        const transaction = action(api.tx);

        setState({ id, call: transaction.decodedCall, value: PENDING });

        return new Promise((resolve, reject) =>
          transaction
            .signSubmitAndWatch(signer, submitOptions ?? options?.txOptions)
            .subscribe({
              next: (value) =>
                setState({ id, call: transaction.decodedCall, value }),
              error: (error) => {
                setState({
                  id,
                  call: transaction.decodedCall,
                  value: MutationError.from(error),
                });
                reject(error);
              },
              complete: resolve,
            }),
        );
      },
      [
        action,
        chainId,
        contextSigner,
        options?.signer,
        options?.txOptions,
        setState,
      ],
    ),
  );

  return [event, submit] as [event: typeof event, submit: typeof submit];
}
