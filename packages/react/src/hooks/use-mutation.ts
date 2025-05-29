import { MutationEventSubjectContext } from "../contexts/mutation.js";
import { SignerContext } from "../contexts/signer.js";
import { tapTx } from "../utils/tap-tx.js";
import type { ChainHookOptions } from "./types.js";
import { useAsyncAction } from "./use-async-action.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { typedApiAtom } from "./use-typed-api.js";
import type { ChainId } from "@reactive-dot/core";
import { MutationError } from "@reactive-dot/core";
import type {
  ChainDescriptorOf,
  TxOptionsOf,
} from "@reactive-dot/core/internal.js";
import { useAtomCallback } from "jotai/utils";
import type { PolkadotSigner, Transaction, TypedApi } from "polkadot-api";
import { use, useCallback } from "react";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";

/**
 * Hook for sending transactions to chains.
 *
 * @group Hooks
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
  options?: ChainHookOptions<TChainId> & {
    /**
     * Override default signer
     */
    signer?: PolkadotSigner;
    /**
     * Additional transaction options
     */
    txOptions?: TxOptionsOf<ReturnType<TAction>>;
  },
) {
  const config = useConfig();
  const chainId = internal_useChainId(options);
  const mutationEventSubject = use(MutationEventSubjectContext);
  const contextSigner = use(SignerContext);

  return useAsyncAction(
    useAtomCallback(
      useCallback(
        (
          get,
          _set,
          submitOptions?: {
            signer?: PolkadotSigner;
            txOptions?: TxOptionsOf<ReturnType<TAction>>;
          },
        ) => {
          const signer =
            submitOptions?.signer ?? options?.signer ?? contextSigner;

          if (signer === undefined) {
            throw new MutationError("No signer provided");
          }

          return from(Promise.resolve(get(typedApiAtom(config, chainId)))).pipe(
            switchMap((typedApi) => {
              const transaction = action(typedApi.tx);

              return transaction
                .signSubmitAndWatch(
                  signer,
                  submitOptions?.txOptions ?? options?.txOptions,
                )
                .pipe(tapTx(mutationEventSubject, chainId, transaction));
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
