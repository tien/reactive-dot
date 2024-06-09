import { chainIdAtom, typedApiAtomFamily } from "../stores/client.js";
import { signerAtom } from "../stores/signer.js";
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
import { useCallback, useState } from "react";

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
  const [state, setState] = useState<Payload>(IDLE);

  const submit = useAtomCallback<
    void,
    [from?: PolkadotSigner, options?: TxOptions<ReturnType<TAction>>]
  >(
    useCallback(
      async (get, _set, submitSigner, submitOptions) => {
        setState(PENDING);

        const defaultChainId = get(chainIdAtom);
        const chainId = options?.chainId ?? defaultChainId;

        if (chainId === undefined) {
          throw new MutationError("No chain ID provided");
        }

        const api = await get(typedApiAtomFamily(chainId));

        const transaction = action(api.tx);

        return new Promise((resolve, reject) =>
          transaction
            .signSubmitAndWatch(
              submitSigner ?? options?.signer ?? get(signerAtom),
              submitOptions ?? options?.txOptions,
            )
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
      [action, options?.chainId, options?.signer, options?.txOptions],
    ),
  );

  return [state, submit] as [state: typeof state, submit: typeof submit];
};
