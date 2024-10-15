<script setup lang="ts">
import Mutation from "./mutation.vue";
import Query from "./query.vue";
import WalletConnection from "./wallet-connection.vue";
import { provideChain } from "@reactive-dot/vue";

provideChain("polkadot");
</script>

<template>
  <Suspense>
    <div>
      <WalletConnection />
      <Query />
      <Mutation />
    </div>
    <template #fallback> Loading... </template>
  </Suspense>
</template>
