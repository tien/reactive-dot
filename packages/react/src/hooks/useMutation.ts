import { ChainIdContext, SignerContext } from "../context.js";
import { typedApiAtomFamily } from "../stores/client.js";
import { IDLE, MutationError, PENDING } from "@reactive-dot/core";
import type { ChainId, Chains, ReDotDescriptor } from "@reactive-dot/types";
import { useAtomCallback } from "jotai/utils";
import type {
  PolkadotSigner,
  Transaction,
  TxEvent,
  TxObservable,
  TypedApi,
} from "polkadot-api";
import { useCallback, useContext, useState } from "react";

type Payload = typeof IDLE | typeof PENDING | MutationError | TxEvent;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxOptions<T extends Transaction<any, any, any, any>> = Parameters<
  TxObservable<
    T extends Transaction<infer _Args, infer _Pallet, infer _Tx, infer Asset>
      ? Asset
      : void
  >
>[1];

export const useMutation = <
  TAction extends (
    builder: TypedApi<
      TChainId extends void ? ReDotDescriptor : Chains[Exclude<TChainId, void>]
    >["tx"],
  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Transaction<any, any, any, any>,
  TChainId extends ChainId | void = void,
>(
  action: TAction,
  options?: {
    chainId?: TChainId;
    signer?: PolkadotSigner;
    txOptions?: TxOptions<ReturnType<TAction>>;
  },
) => {
  const contextChainId = useContext(ChainIdContext);
  const contextSigner = useContext(SignerContext);

  const [state, setState] = useState<Payload>(IDLE);

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

        const chainId = options?.chainId ?? contextChainId;

        if (chainId === undefined) {
          throw new MutationError("No chain ID provided");
        }

        const api = await get(typedApiAtomFamily(chainId));

        const transaction = action(api.tx);

        return new Promise((resolve, reject) =>
          transaction
            .signSubmitAndWatch(signer, submitOptions ?? options?.txOptions)
            .subscribe({
              next: setState,
              error: (error) => {
                setState(new MutationError(undefined, { cause: error }));
                reject(error);
              },
              complete: resolve,
            }),
        );
      },
      [
        action,
        contextChainId,
        contextSigner,
        options?.chainId,
        options?.signer,
        options?.txOptions,
      ],
    ),
  );

  return [state, submit] as [state: typeof state, submit: typeof submit];
};
