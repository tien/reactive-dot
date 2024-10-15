import { SignerContext } from "../contexts/index.js";
import {
  type MutationEvent,
  MutationEventSubjectContext,
} from "../contexts/mutation.js";
import { typedApiAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { useAsyncState } from "./use-async-state.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import type { ChainId, Chains } from "@reactive-dot/core";
import { MutationError, pending } from "@reactive-dot/core";
import { useAtomCallback } from "jotai/utils";
import type {
  PolkadotSigner,
  Transaction,
  TxEvent,
  TxObservable,
  TypedApi,
} from "polkadot-api";
import { useCallback, useContext } from "react";

type MaybePromise<T> = T | Promise<T>;

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
 * @param builder - The function to create the transaction
 * @param options - Additional options
 * @returns The current transaction state & submit function
 */
export function useMutation<
  TBuilder extends (
    tx: TypedApi<Chains[TChainId]>["tx"],
  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MaybePromise<Transaction<any, any, any, any>>,
  TChainId extends ChainId,
>(
  builder: TBuilder,
  options?: ChainHookOptions<TChainId> & {
    /**
     * Override default signer
     */
    signer?: PolkadotSigner;
    /**
     * Additional transaction options
     */
    txOptions?: TxOptions<Awaited<ReturnType<TBuilder>>>;
  },
) {
  const config = useConfig();
  const chainId = internal_useChainId(options);
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
    [
      options?: TxOptions<Awaited<ReturnType<TBuilder>>> & {
        signer: PolkadotSigner;
      },
    ]
  >(
    useCallback(
      async (get, _set, submitOptions) => {
        const id = globalThis.crypto.randomUUID();

        setState({ id, value: pending });

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

        const api = await get(typedApiAtomFamily({ config, chainId }));

        const transaction = await builder(api.tx);

        setState({ id, call: transaction.decodedCall, value: pending });

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
        builder,
        chainId,
        config,
        contextSigner,
        options?.signer,
        options?.txOptions,
        setState,
      ],
    ),
  );

  return [event, submit] as [event: typeof event, submit: typeof submit];
}
