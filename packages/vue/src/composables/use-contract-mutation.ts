import { mutationEventKey } from "../keys.js";
import type { ChainComposableOptions } from "../types.js";
import { useAsyncAction } from "./use-async-action.js";
import { useChainId } from "./use-chain-id.js";
import { getInkClient } from "./use-ink-client.js";
import { useLazyValuesCache } from "./use-lazy-value.js";
import { tapTx } from "./use-mutation.js";
import { useSigner } from "./use-signer.js";
import { useTypedApiPromise } from "./use-typed-api.js";
import { MutationError } from "@reactive-dot/core";
import type {
  InkMutationBuilder,
  PatchedReturnType,
  TxOptionsOf,
} from "@reactive-dot/core/internal.js";
import { getInkContractTx } from "@reactive-dot/core/internal/actions.js";
import type { PolkadotSigner } from "polkadot-api";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { inject, toValue } from "vue";

/**
 * Composable for mutating (writing to) a contract.
 *
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
  options?: ChainComposableOptions & {
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
  const cache = useLazyValuesCache();
  const injectedSigner = useSigner();
  const chainId = useChainId();
  const typedApiPromise = useTypedApiPromise();
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
      txOptions: TxOptionsOf<Awaited<ReturnType<TAction>>>;
    }) => {
      const signer =
        submitOptions?.signer ?? toValue(options?.signer) ?? injectedSigner;

      if (signer === undefined) {
        throw new MutationError("No signer provided");
      }

      return from(
        Promise.resolve(
          action(async (contract, contractAddress, message, body) =>
            getInkContractTx(
              await toValue(typedApiPromise),
              await toValue(getInkClient(contract, cache)),
              signer,
              contractAddress,
              message,
              body,
            ),
          ),
        ),
      ).pipe(
        switchMap((tx) =>
          tx
            .signSubmitAndWatch(
              signer,
              submitOptions?.txOptions ?? toValue(options?.txOptions),
            )
            .pipe(tapTx(mutationEventRef, chainId.value, tx)),
        ),
      );
    },
  );
}
