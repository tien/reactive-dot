<script setup lang="ts">
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
    </div>
    <template #fallback> Loading... </template>
  </Suspense>
</template>
