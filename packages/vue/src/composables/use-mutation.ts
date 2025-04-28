import { mutationEventKey } from "../keys.js";
import type { ChainComposableOptions } from "../types.js";
import { useAsyncAction } from "./use-async-action.js";
import { useChainId } from "./use-chain-id.js";
import { useSigner } from "./use-signer.js";
import { useTypedApiPromise } from "./use-typed-api.js";
import type { ChainId } from "@reactive-dot/core";
import { MutationError } from "@reactive-dot/core";
import type {
  ChainDescriptorOf,
  TxOptionsOf,
} from "@reactive-dot/core/internal.js";
import type { PolkadotSigner, Transaction, TypedApi } from "polkadot-api";
import { from } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { inject, type MaybeRefOrGetter, toValue } from "vue";

/**
 * Composable for sending transactions to chains.
 *
 * @param action - The function to create the transaction
 * @param options - Additional options
 * @returns The current transaction state & submit function
 */
export function useMutation<
  TAction extends (
    tx: TypedApi<ChainDescriptorOf<TChainId>>["tx"],
  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Transaction<any, any, any, any>,
  TChainId extends ChainId | undefined,
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
    txOptions?: MaybeRefOrGetter<TxOptionsOf<ReturnType<TAction>> | undefined>;
  },
) {
  const injectedSigner = useSigner();
  const typedApiPromise = useTypedApiPromise();
  const chainId = useChainId();

  const mutationEventRef = inject(
    mutationEventKey,
    () => {
      throw new Error("No mutation event ref provided");
    },
    true,
  );

  return useAsyncAction(
    (submitOptions?: {
      signer: PolkadotSigner;
      txOptions: TxOptionsOf<ReturnType<TAction>>;
    }) => {
      const signer =
        submitOptions?.signer ?? toValue(options?.signer) ?? injectedSigner;

      if (signer === undefined) {
        throw new MutationError("No signer provided");
      }

      const id = globalThis.crypto.randomUUID();

      return from(typedApiPromise.value).pipe(
        switchMap((typedApi) => {
          const transaction = action(typedApi.tx);

          const eventProps = {
            id,
            chainId: chainId.value,
            call: transaction.decodedCall,
          };

          mutationEventRef.value = { ...eventProps, status: "pending" };

          return transaction
            .signSubmitAndWatch(
              signer,
              submitOptions?.txOptions ?? toValue(options?.txOptions),
            )
            .pipe(
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
        }),
      );
    },
  );
}
