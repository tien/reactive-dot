import { MutationEventSubjectContext } from "../contexts/mutation.js";
import { SignerContext } from "../contexts/signer.js";
import type { ChainHookOptions } from "./types.js";
import { useAsyncAction } from "./use-async-action.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { inkClientAtom } from "./use-ink-client.js";
import { tapTx } from "./use-mutation.js";
import { typedApiAtom } from "./use-typed-api.js";
import { MutationError } from "@reactive-dot/core";
import type {
  InkMutationBuilder,
  PatchedReturnType,
  TxOptionsOf,
} from "@reactive-dot/core/internal.js";
import { getInkContractTx } from "@reactive-dot/core/internal/actions.js";
import { useAtomCallback } from "jotai/utils";
import type { PolkadotSigner } from "polkadot-api";
import { use } from "react";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";

/**
 * Hook for mutating (writing to) a contract.
 *
 * @group Hooks
 * @param action - The function to create the transaction
 * @param options - Additional options
 * @returns The current transaction state & submit function
 */
export function useContractMutation<
  TAction extends (
    builder: InkMutationBuilder,
  ) => PatchedReturnType<InkMutationBuilder>,
>(
  action: TAction,
  options?: ChainHookOptions & {
    /**
     * Override default signer
     */
    signer?: PolkadotSigner;
    /**
     * Additional transaction options
     */
    txOptions?: TxOptionsOf<Awaited<ReturnType<TAction>>>;
  },
) {
  const config = useConfig();
  const chainId = internal_useChainId(options);
  const contextSigner = use(SignerContext);
  const mutationEventSubject = use(MutationEventSubjectContext);

  return useAsyncAction(
    useAtomCallback(
      async (
        get,
        _,
        submitOptions?: {
          signer?: PolkadotSigner;
          txOptions?: TxOptionsOf<Awaited<ReturnType<TAction>>>;
        },
      ) => {
        const signer =
          submitOptions?.signer ?? options?.signer ?? contextSigner;

        if (signer === undefined) {
          throw new MutationError("No signer provided");
        }

        return from(
          Promise.resolve(
            action(async (contract, address, message, body) => {
              return getInkContractTx(
                ...(await Promise.all([
                  get(typedApiAtom(config, chainId)),
                  get(inkClientAtom(contract)),
                ])),
                signer,
                address,
                message,
                body,
              );
            }),
          ),
        ).pipe(
          switchMap((tx) =>
            tx
              .signSubmitAndWatch(
                signer,
                submitOptions?.txOptions ?? options?.txOptions,
              )
              .pipe(tapTx(mutationEventSubject, chainId, tx)),
          ),
        );
      },
    ),
  );
}
