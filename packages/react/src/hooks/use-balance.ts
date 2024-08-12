import type { ChainHookOptions } from "./types.js";
import { useNativeTokenAmountFromPlanck } from "./use-native-token-amount.js";
import { useLazyLoadQuery } from "./use-query.js";
import { type DenominatedNumber, BigIntMath } from "@reactive-dot/utils";
import type { SS58String } from "polkadot-api";

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

type Options = ChainHookOptions & {
  includesExistentialDeposit?: boolean;
};

/**
 * Hook for getting an account's spendable balance.
 *
 * @param address - The account's address
 * @param options - Additional options
 * @returns The account's spendable balance
 */
export function useSpendableBalance(
  address: SS58String,
  options?: Options,
): DenominatedNumber;
/**
 * Hook for getting accounts’ spendable balances.
 *
 * @param addresses  - The account-addresses
 * @param options - Additional options
 * @returns The accounts’ spendable balances
 */
export function useSpendableBalance(
  addresses: SS58String[],
  options?: Options,
): DenominatedNumber[];
export function useSpendableBalance(
  addressOrAddresses: SS58String | SS58String[],
  { includesExistentialDeposit = false, ...options }: Options = {},
): DenominatedNumber | DenominatedNumber[] {
  const addresses = Array.isArray(addressOrAddresses)
    ? addressOrAddresses
    : [addressOrAddresses];

  const [existentialDeposit, accounts] = useLazyLoadQuery(
    (builder) =>
      builder.getConstant("Balances", "ExistentialDeposit").readStorages(
        "System",
        "Account",
        addresses.map((address) => [address] as const),
      ),
    options,
  ) as [bigint, SystemAccount[]];

  const nativeTokenFromPlanck = useNativeTokenAmountFromPlanck(options);

  const spendableNativeTokenFromAccount = ({
    data: { free, reserved, frozen },
  }: SystemAccount) =>
    nativeTokenFromPlanck(
      BigIntMath.max(
        0n,
        free -
          BigIntMath.max(
            frozen - reserved,
            includesExistentialDeposit ? 0n : existentialDeposit,
          ),
      ),
    );

  const spendableBalances = accounts.map(spendableNativeTokenFromAccount);

  return Array.isArray(addressOrAddresses)
    ? spendableBalances
    : spendableBalances.at(0)!;
}
