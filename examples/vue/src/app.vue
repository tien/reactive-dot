<script setup lang="ts">
import Query from "./query.vue";
import { provideChain } from "@reactive-dot/vue";

provideChain("polkadot");
</script>

<template>
  <Suspense>
    <Query />
    <template #fallback> Loading... </template>
  </Suspense>
</template>
