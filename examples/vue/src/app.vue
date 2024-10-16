<script setup lang="ts">
import Mutation from "./mutation.vue";
import Query from "./query.vue";
import WalletConnection from "./wallet-connection.vue";
import type { ChainId } from "@reactive-dot/core";
import { provideChain, useChainIds } from "@reactive-dot/vue";
import { ref } from "vue";

const chainIds = useChainIds();
const selectedChainId = ref<ChainId>("polkadot");

provideChain(selectedChainId);
</script>

<template>
  <div>
    <label>
      Chain
      <select v-model="selectedChainId">
        <option v-for="chainId in chainIds" :value="chainId">
          {{ chainId }}
        </option>
      </select>
    </label>
  </div>
  <Suspense :key="selectedChainId">
    <div>
      <WalletConnection />
      <Query />
      <Mutation />
    </div>
    <template #fallback>Loading... </template>
  </Suspense>
</template>
