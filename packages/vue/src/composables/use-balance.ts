import type {
  ChainComposableOptions,
  PromiseLikeAsyncState,
} from "../types.js";
import { useAsyncData } from "./use-async-data.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useLazyValue } from "./use-lazy-value.js";
import { useNativeTokenPromise } from "./use-native-token.js";
import { useQueryObservable } from "./use-query.js";
import { spendableBalance } from "@reactive-dot/core/internal/maths.js";
import { type DenominatedNumber } from "@reactive-dot/utils";
import type { SS58String } from "polkadot-api";
import { combineLatest, from } from "rxjs";
import { map } from "rxjs/operators";
import { computed, type MaybeRefOrGetter, toValue } from "vue";

type SystemAccount = {
  nonce: number;
  consumers: number;
  providers: number;
  sufficients: number;
  data: {
    free: bigint;
    reserved: bigint;
    frozen: bigint;
    flags: bigint;
  };
};

type Options = ChainComposableOptions & {
  includesExistentialDeposit?: MaybeRefOrGetter<boolean>;
};

/**
 * Composable for getting an account's spendable balance.
 *
 * @param address - The account's address
 * @param options - Additional options
 * @returns The account's spendable balance
 */
export function useSpendableBalance(
  address: MaybeRefOrGetter<SS58String>,
  options?: Options,
): PromiseLikeAsyncState<DenominatedNumber>;
/**
 * Composable for getting accounts’ spendable balances.
 *
 * @param addresses  - The account-addresses
 * @param options - Additional options
 * @returns The accounts’ spendable balances
 */
export function useSpendableBalance(
  addresses: MaybeRefOrGetter<SS58String[]>,
  options?: Options,
): PromiseLikeAsyncState<DenominatedNumber[]>;
export function useSpendableBalance(
  addressOrAddresses: MaybeRefOrGetter<SS58String | SS58String[]>,
  options?: Options,
): PromiseLikeAsyncState<DenominatedNumber | DenominatedNumber[]> {
  const chainId = internal_useChainId(options);

  const addresses = computed(() => {
    const addressOrAddressesValue = toValue(addressOrAddresses);
    return Array.isArray(addressOrAddressesValue)
      ? toValue(addressOrAddressesValue)
      : [toValue(addressOrAddressesValue)];
  });

  const includesExistentialDeposit = computed(
    () => toValue(options?.includesExistentialDeposit) ?? false,
  );

  const dataObservable = useQueryObservable(
    (builder) =>
      builder.constant("Balances", "ExistentialDeposit").storages(
        "System",
        "Account",
        addresses.value.map((address) => [address] as const),
      ),
    options,
  );

  const nativeTokenPromise = useNativeTokenPromise(options);

  return useAsyncData(
    useLazyValue(
      computed(() => [
        "spendable-balances",
        chainId.value,
        ...addresses.value.toSorted(),
      ]),
      () => {
        const includesExistentialDepositValue =
          includesExistentialDeposit.value;

        return combineLatest([
          dataObservable.value,
          from(nativeTokenPromise.value),
        ]).pipe(
          map(([[existentialDeposit, accounts], { amountFromPlanck }]) =>
            (accounts as SystemAccount[]).map(
              ({ data: { free, reserved, frozen } }) =>
                amountFromPlanck(
                  spendableBalance({
                    free,
                    reserved,
                    frozen,
                    existentialDeposit: existentialDeposit as bigint,
                    includesExistentialDeposit: includesExistentialDepositValue,
                  }),
                ),
            ),
          ),
          map((balances) =>
            Array.isArray(toValue(addressOrAddresses))
              ? balances
              : balances[0]!,
          ),
        );
      },
    ),
  );
}
