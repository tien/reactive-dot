<script setup lang="ts">
import FlipperContract from "./flipper-contract.vue";
import Psp22Token from "./psp22-token.vue";
import { provideChain } from "@reactive-dot/vue";

provideChain("pop_testnet");
</script>

<template>
  <section>
    <h2>Contracts</h2>
    <Psp22Token address="16dg7W38UBuVZQMZkTVYmYPLuaFQ3bfE9ZLS4jAeKJzC2E7d" />
    <FlipperContract
      address="14MRHYDcgWmeEsJbfjvjrnyeDrTaF1pAK4UkQEbAyDvP2UqF"
    />
  </section>
</template>
