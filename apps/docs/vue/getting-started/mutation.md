---
sidebar_position: 4
---

# Mutation

The `useMutation` composable allow you to sign & submit transaction to a chain.

## Connect wallet & accounts

Follow the [Connect wallets](./connect-wallets.mdx) guide to get this set up.

## Choose the signer

There are multiple way to select the account used for signing.

### 1. Via dependency injection

```vue
<script setup lang="ts">
import { provideSigner } from "@reactive-dot/vue";

provideSigner(someSigner);
</script>
```

### 2. Passing signer to the composable

```vue
<script setup lang="ts">
import { useAccounts, useMutation } from "@reactive-dot/vue";

const accounts = await useAccounts();

const { execute, status } = useMutation(
  (tx) => tx.NominationPools.claim_payout(),
  { signer: accounts.value.at(0)?.polkadotSigner },
);
</script>
```

### 2. Passing signer to the final submission

```vue
<script setup lang="ts">
import { useAccounts, useMutation } from "@reactive-dot/vue";

const accounts = await useAccounts();

const { execute, status } = useMutation((tx) => tx.Identity.clear_identity());

execute({ signer: accounts.value.at(0)?.polkadotSigner });
</script>
```

## Submitting transaction

```vue
<script setup lang="ts">
import { useMutation } from "@reactive-dot/vue";
import { Binary } from "polkadot-api";

const { execute, status } = useMutation((tx) =>
  tx.System.remark({ remark: Binary.fromText("Hello from reactive-dot!") }),
);
</script>

<template>
  <div v-if="status === 'idle'">No transaction submitted yet</div>
  <div v-else-if="status === 'pending'">Submitting transaction...</div>
  <div v-else-if="status === 'error'">Error submitting transaction!</div>
  <div v-else>
    Submitted tx with hash: {{ status.txHash }}, with the current state of:
    {{ remarkState.type }}
  </div>
</template>
```

## Watching transactions

It’s common to watch for all transactions throughout the application to display an appropriate loading state or toast. This can be easily achieved with the [`watchMutationEffect`](/api/vue/function/watchMutationEffect) composable.

```vue
<script setup lang="ts">
import { watchMutationEffect } from "@reactive-dot/vue";

watchMutationEffect((event) => {
  if (event.status === "pending") {
    console.info("Submitting transaction", { id: event.id });
    return;
  }

  if (event.status === "error") {
    console.error("Failed to submit transaction", { id: event.id });
    return;
  }

  switch (event.data.type) {
    case "finalized":
      if (event.data.ok) {
        console.info("Transaction succeeded", { id: event.id });
      } else {
        console.error("Transaction failed", { id: event.id });
      }
      break;
    default:
      console.loading("Transaction pending", { id: event.id });
  }
});
</script>
```
