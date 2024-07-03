import { SignerContext } from "../context.js";
import { typedApiAtomFamily } from "../stores/client.js";
import type { ChainHookOptions } from "./types.js";
import { useAsyncState } from "./useAsyncState.js";
import useChainId from "./useChainId.js";
import type { ChainId, Chains, CommonDescriptor } from "@reactive-dot/core";
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
    builder: TypedApi<
      TChainId extends void ? CommonDescriptor : Chains[Exclude<TChainId, void>]
    >["tx"],
  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Transaction<any, any, any, any>,
  TChainId extends ChainId | void = void,
>(
  action: TAction,
  options?: ChainHookOptions<{
    /**
     * Override default signer
     */
    signer?: PolkadotSigner;
    /**
     * Additional transaction options
     */
    txOptions?: TxOptions<ReturnType<TAction>>;
  }>,
) {
  const chainId = useChainId(options);
  const contextSigner = useContext(SignerContext);

  const [state, setState] = useAsyncState<TxEvent>();

  const submit = useAtomCallback<
    void,
    [from?: PolkadotSigner, options?: TxOptions<ReturnType<TAction>>]
  >(
    useCallback(
      async (get, _set, submitSigner, submitOptions) => {
        setState(PENDING);

        const signer = submitSigner ?? options?.signer ?? contextSigner;

        if (signer === undefined) {
          throw new MutationError("No signer provided");
        }

        const api = await get(typedApiAtomFamily(chainId));

        const transaction = action(api.tx);

        return new Promise((resolve, reject) =>
          transaction
            .signSubmitAndWatch(signer, submitOptions ?? options?.txOptions)
            .subscribe({
              next: setState,
              error: (error) => {
                setState(MutationError.from(error));
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

  return [state, submit] as [state: typeof state, submit: typeof submit];
}
