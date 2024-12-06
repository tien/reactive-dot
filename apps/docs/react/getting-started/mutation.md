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
import { SignerProvider } from "@reactive-dot/react";

function App() {
  return <SignerProvider signer={someSigner}>{/* ... */}</SignerProvider>;
}
```

### 2. Passing signer to the hook

```tsx
import { useAccounts, useMutation } from "@reactive-dot/react";
import { use } from "react";

const accounts = use(useAccounts());

const [claimState, claim] = useMutation(
  (tx) => tx.NominationPools.claim_payout(),
  { signer: accounts.at(0)?.polkadotSigner },
);
```

### 2. Passing signer to the final submission

```tsx
import { useAccounts, useMutation } from "@reactive-dot/react";
import { use } from "react";

const accounts = use(useAccounts());

const [clearIdentityState, clearIdentity] = useMutation((tx) =>
  tx.Identity.clear_identity(),
);

clearIdentity({ signer: accounts.at(0)?.polkadotSigner });
```

## Submitting transaction

```tsx
import { idle, MutationError, pending } from "@reactive-dot/core";
import { useMutation } from "@reactive-dot/react";
import { Binary } from "polkadot-api";

function Component() {
  const [remarkState, submit] = useMutation((tx) =>
    tx.System.remark({ remark: Binary.fromText("Hello from reactive-dot!") }),
  );

  switch (remarkState) {
    case idle:
      return <div>No transaction submitted yet</div>;
    case pending:
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

## Watching transactions

It’s common to watch for all transactions throughout the application to display an appropriate loading state or toast. This can be easily achieved with the [`useMutationEffect`](/api/react/function/useMutationEffect) hook.

```tsx
import { idle, MutationError, pending } from "@reactive-dot/core";
import { useMutationEffect } from "@reactive-dot/react";
import toast from "react-hot-toast";

function Watcher() {
  useMutationEffect((event) => {
    if (event.value === pending) {
      toast.loading("Submitting transaction", { id: event.id });
      return;
    }

    if (event.value instanceof MutationError) {
      toast.error("Failed to submit transaction", { id: event.id });
      return;
    }

    switch (event.value.type) {
      case "finalized":
        if (event.value.ok) {
          toast.success("Transaction succeeded", { id: event.id });
        } else {
          toast.error("Transaction failed", { id: event.id });
        }
        break;
      default:
        toast.loading("Transaction pending", { id: event.id });
    }
  });
}
```
