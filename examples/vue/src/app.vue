<script setup lang="ts">
import MutationSection from "./mutation-section.vue";
import QuerySection from "./query-section.vue";
import WalletConnection from "./wallet-connection.vue";
import type { ChainId } from "@reactive-dot/core";
import {
  provideChain,
  useChainIds,
  useQueryErrorResetter,
} from "@reactive-dot/vue";
import { onErrorCaptured, ref } from "vue";

const chainIds = useChainIds();

const selectedChainId = ref<ChainId>("polkadot");
const hasError = ref(false);

const resetError = useQueryErrorResetter();

onErrorCaptured(() => (hasError.value = true));

provideChain(selectedChainId);
</script>

<template>
  <div>
    <label>
      Chain
      <select v-model="selectedChainId">
        <option v-for="chainId in chainIds" :key="chainId" :value="chainId">
          {{ chainId }}
        </option>
      </select>
    </label>
  </div>
  <article v-if="hasError">
    <header>
      <strong>Oops, something went wrong!</strong>
    </header>
    <button
      @click="
        resetError();
        hasError = false;
      "
    >
      Retry
    </button>
  </article>
  <Suspense v-else :key="selectedChainId">
    <div>
      <WalletConnection />
      <QuerySection />
      <MutationSection />
    </div>
    <template #fallback>Loading...</template>
  </Suspense>
</template>
