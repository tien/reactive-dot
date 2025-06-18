---
sidebar_position: 6
---

# Smart contract

ReactiveDOT works with [Ink! contracts](https://use.ink) on chains with PolkaVM support, such as [Polkadot Asset Hub](https://polkadot.com/platform/hub) or [Pop Network](https://pop.r0gue.io/network).

:::warning

Contract support via PolkaVM on Polkadot is still in alpha.

:::

:::tip

If you're new to ReactiveDOT, we strongly recommend starting with the [“Getting started guide”](/react/category/getting-started). This guide covers essential topics such as connecting to a blockchain, setting up wallets, querying data, and handling errors effectively.

:::

## Defining contract

ReactiveDOT utilizes Ink! [metadata](https://use.ink/docs/v6/basics/metadata/ink) to interact with and provide types for contracts. Metadata files typically end with `.json` or `.contract` and can be obtained by [compiling](https://use.ink/docs/v6/getting-started/building-your-contract) the contract yourself or from the contract developers.

Once you've obtained the metadata file(s), run the following command to convert it to TypeScript-friendly metadata:

```bash
npx papi ink add "/path/to/metadata.(json|contract)" --key "myContract"
```

:::info

For more information on contract metadata type generation, refer to this [documentation](https://papi.how/ink#codegen) provided by [Polkadot-API](https://papi.how).

:::

The contract metadata can now be imported and configured as follows:

```ts title="contracts.ts"
import { contracts } from "@polkadot-api/descriptor";
import { defineContract } from "@reactive-dot/core";

export const myContract = defineContract({
  descriptor: contracts.myContract,
});
```

## Reading contract data

The [`useLazyLoadQuery`](/api/react/function/useLazyLoadQuery) hook with [`Query.contract`](/api/core/class/Query#contract) instruction allows you to read data on a smart contract, from [storage](https://use.ink/docs/v6/basics/storing-values) or a [view (read-only) message](https://use.ink/docs/v6/basics/reading-values#contract-functions). They can only read the state of the contract, and cannot make any changes to it.

```tsx title="Component.tsx"
import { myContract } from "./contracts.ts";
import { useLazyLoadQuery } from "@reactive-dot/react";

function Component() {
  const [metadata, balance, freeBalance] = useLazyLoadQuery((builder) =>
    builder.contract(myContract, CONTRACT_ADDRESS, (builder) =>
      builder
        // Root storage
        .rootStorage()
        // Nested storage
        .storage("balance", ACCOUNT_ADDRESS)
        // Readonly message
        .message("free_balance", ACCOUNT_ADDRESS),
    ),
  );

  return (
    <div>
      <p>Metadata: {JSON.stringify(metadata)}</p>
      <p>Balance: {balance}</p>
      <p>Free Balance: {freeBalance}</p>
    </div>
  );
}
```

### Multi query

Similar to chain [multi-query](/react/getting-started/query#fetching-multiple-data), the `contracts`, `storages`, and `messages` instructions enable reading multiple pieces of data in parallel.

```tsx title="MultiQueryComponent.tsx"
import { myContract } from "./contracts.ts";
import { useLazyLoadQuery } from "@reactive-dot/react";

function Component() {
  const results = useLazyLoadQuery((builder) =>
    builder.contracts(
      myContract,
      [CONTRACT_ADDRESS_1, CONTRACT_ADDRESS_2],
      (builder) =>
        builder
          .storage("symbol")
          .storages("balance", [ACCOUNT_1_ADDRESS, ACCOUNT_2_ADDRESS])
          .messages("free_balance", [ACCOUNT_1_ADDRESS, ACCOUNT_2_ADDRESS]),
    ),
  );

  return (
    <div>
      {results.map(([symbol, balances, freeBalances], index) => (
        <div key={index}>
          <p>Symbol: {symbol}</p>
          <p>Balances: {balances.join(", ")}</p>
          <p>Free Balances: {freeBalances.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
```

## Writing to contract

The [`useContractMutation`](/api/react/function/useContractMutation) hook allows you to mutate data on a smart contract, from a payable or nonpayable (write) message.

```tsx title="WriteComponent.tsx"
import { myContract } from "./contracts.ts";
import { idle, MutationError, pending } from "@reactive-dot/core";
import { useContractMutation } from "@reactive-dot/react";

function Component() {
  const [status, mint] = useContractMutation((mutate) =>
    mutate(myContract, "mint", {
      data: { id: 1 },
      value: 10_000n,
    }),
  );

  return (
    <div>
      <button onClick={() => mint()}>Mint</button>
      {(() => {
        switch (status) {
          case idle:
            return <p>No transaction submitted yet.</p>;
          case pending:
            return <p>Submitting transaction...</p>;
          default:
            if (status instanceof MutationError) {
              return <p>Error submitting transaction!</p>;
            }

            return (
              <p>
                Submitted tx with hash: {status.txHash}, current state:{" "}
                {status.type}
              </p>
            );
        }
      })()}
    </div>
  );
}
```
