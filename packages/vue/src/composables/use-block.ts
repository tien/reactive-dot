import type { ChainComposableOptions } from "../types.js";
import { useAsyncData } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useClientPromise } from "./use-client.js";
import { useLazyValue } from "./use-lazy-value.js";
import { getBlock } from "@reactive-dot/core/internal/actions.js";
import { from, switchMap } from "rxjs";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

/**
 * Composable for fetching information about the latest block.
 *
 * @param tag - Which block to target
 * @param options - Additional options
 * @returns The latest finalized or best block
 */
export function useBlock(
  tag: MaybeRefOrGetter<"best" | "finalized"> = "finalized",
  options?: ChainComposableOptions,
) {
  const chainId = internal_useChainId(options);
  const client = useClientPromise();

  return useAsyncData(
    useLazyValue(
      computed(() => ["block", chainId.value, toValue(tag)]),
      () =>
        from(client.value).pipe(
          switchMap((client) => getBlock(client, { tag: toValue(tag) })),
        ),
    ),
  );
}
