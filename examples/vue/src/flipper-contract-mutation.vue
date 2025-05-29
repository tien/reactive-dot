<script setup lang="ts">
import { flipper } from "./contracts";
import { useContractMutation } from "@reactive-dot/vue";
import { watchEffect } from "vue";

const { address } = defineProps<{
  address: string;
}>();

const emit = defineEmits<{ (e: "flip"): void }>();

const {
  execute: flip,
  status,
  data,
} = useContractMutation((mutate) => mutate(flipper, address, "flip", {}));

watchEffect(() => {
  if (status.value === "success" && data.value?.type === "finalized") {
    emit("flip");
  }
});
</script>

<template>
  <button @click="flip()">Flip</button>
</template>
