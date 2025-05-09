<script setup lang="ts">
import { useMutation } from "@reactive-dot/vue";
import { Binary } from "polkadot-api";

const { execute, data, status } = useMutation((tx) =>
  tx.System.remark({ remark: Binary.fromText("Hello from reactive-dot!") }),
);
</script>

<template>
  <article>
    <header><h4>Remark</h4></header>
    <button @click="execute()">Hello</button>
    <p v-if="status === 'pending'">Submitting transaction...</p>
    <p v-else-if="status === 'error'">Error submitting transaction</p>
    <p v-else-if="status === 'success'">
      Submitted tx {{ data?.txHash }} is {{ data?.type }}
    </p>
  </article>
</template>
