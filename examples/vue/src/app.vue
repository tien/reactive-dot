<script setup lang="ts">
import ContractsSection from "./contracts-section.vue";
import MutationSection from "./mutation-section.vue";
import QuerySection from "./query-section.vue";
import WalletConnection from "./wallet-connection.vue";
import type { ChainId } from "@reactive-dot/core";
import {
  provideChain,
  useChainIds,
  useQueryErrorResetter,
  watchMutationEffect,
} from "@reactive-dot/vue";
import { onErrorCaptured, ref } from "vue";

const chainIds = useChainIds();
const selectedChainId = ref<ChainId>("polkadot");
provideChain(selectedChainId);

const hasError = ref(false);
const { execute: resetError } = useQueryErrorResetter();
onErrorCaptured(() => (hasError.value = true));

// Useful tracking all submitted transaction, i.e. for toast notification
// eslint-disable-next-line no-undef
watchMutationEffect((event) => console.log(event));
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
    <template #fallback><p>Loading chain...</p></template>
  </Suspense>
  <Suspense>
    <ContractsSection />
    <template #fallback><p>Loading contracts...</p></template>
  </Suspense>
</template>
