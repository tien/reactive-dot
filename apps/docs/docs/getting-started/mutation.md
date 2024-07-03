---
sidebar_position: 4
---

# Mutation

The `useMutation` hook allow you to sign & submit transaction to a chain.

## Connect wallet & accounts

Follow the [Connect wallets](./connect-wallets.mdx) guide to get this set up.

## Choose the signer

There are multiple way to select the account used for signing.

### 1. Via context

```tsx
import { ReDotSignerProvider } from "@reactive-dot/react";

function App() {
  return (
    <ReDotSignerProvider signer={someSigner}>{/* ... */}</ReDotSignerProvider>
  );
}
```

### 2. Passing signer to the hook

```tsx
import { useAccounts, useMutation } from "@reactive-dot/react";

const accounts = useAccounts();

const [claimState, claim] = useMutation(
  (tx) => tx.NominationPools.claim_payout(),
  { signer: accounts.at(0)?.polkadotSigner },
);
```

### 2. Passing signer to the final submission

```tsx
import { useAccounts, useMutation } from "@reactive-dot/react";

const accounts = useAccounts();

const [clearIdentityState, clearIdentity] = useMutation((tx) =>
  tx.Identity.clear_identity(),
);

clearIdentity(accounts.at(0)?.polkadotSigner);
```

## Submitting transaction

```tsx
import { IDLE, MutationError, PENDING } from "@reactive-dot/core";
import { useMutation } from "@reactive-dot/react";
import { Binary } from "polkadot-api";

function Component() {
  const [transactionState, submit] = useMutation((tx) =>
    tx.System.remark({ remark: Binary.fromText("Hello from reactive-dot!") }),
  );

  switch (transactionState) {
    case IDLE:
      return <div>No transaction submitted yet</div>;
    case PENDING:
      return <div>Submitting transaction...</div>;
    default:
      if (remarkState instanceof MutationError) {
        return <div>Error submitting transaction!</div>;
      }

      return (
        <div>
          Submitted tx with hash: {remarkState.txHash}, with the current state
          of: {remarkState.type}
        </div>
      );
  }
}
```
