import type { ChainComposableOptions } from "./types.js";
import { useAsyncAction } from "./use-async-action.js";
import { useSigner } from "./use-signer.js";
import { useTypedApiPromise } from "./use-typed-api.js";
import type { ChainId, Chains } from "@reactive-dot/core";
import { MutationError } from "@reactive-dot/core";
import type {
  PolkadotSigner,
  Transaction,
  TxObservable,
  TypedApi,
} from "polkadot-api";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { type MaybeRefOrGetter, toValue } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TxOptions<T extends Transaction<any, any, any, any>> = Parameters<
  TxObservable<
    T extends Transaction<infer _Args, infer _Pallet, infer _Tx, infer Asset>
      ? Asset
      : void
  >
>[1];

/**
 * Composable for sending transactions to chains.
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
  options?: ChainComposableOptions<TChainId> & {
    /**
     * Override default signer
     */
    signer?: MaybeRefOrGetter<PolkadotSigner | undefined>;
    /**
     * Additional transaction options
     */
    txOptions?: MaybeRefOrGetter<TxOptions<ReturnType<TAction>> | undefined>;
  },
) {
  const injectedSigner = useSigner();
  const typedApiPromise = useTypedApiPromise();

  return useAsyncAction(
    (
      submitOptions?: TxOptions<ReturnType<TAction>> & {
        signer: PolkadotSigner;
      },
    ) => {
      const signer =
        submitOptions?.signer ?? toValue(options?.signer) ?? injectedSigner;

      if (signer === undefined) {
        throw new MutationError("No signer provided");
      }

      return from(typedApiPromise.value).pipe(
        switchMap((typedApi) =>
          action(typedApi.tx).signSubmitAndWatch(
            signer,
            submitOptions ?? toValue(options?.txOptions),
          ),
        ),
      );
    },
  );
}
