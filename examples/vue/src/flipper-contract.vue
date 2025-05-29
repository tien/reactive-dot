<script setup lang="ts">
import AccountGuard from "./account-guard.vue";
import { flipper } from "./contracts";
import FlipperContractMutation from "./flipper-contract-mutation.vue";
import { useQuery } from "@reactive-dot/vue";

const { address } = defineProps<{
  address: string;
}>();

const { data: flipped, refresh } = useQuery((builder) =>
  builder.contract(flipper, address, (builder) => builder.message("get")),
);
</script>

<template>
  <article>
    <h3>Flipper</h3>
    <p>Flipped: {{ flipped }}</p>
    <AccountGuard
      ><FlipperContractMutation :address="address" @flip="refresh()"
    /></AccountGuard>
  </article>
</template>
