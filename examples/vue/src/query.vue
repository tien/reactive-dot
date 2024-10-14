<script setup lang="ts">
import { useLazyLoadQuery } from "@reactive-dot/vue";

const { data } = await useLazyLoadQuery((builder) =>
  builder
    .readStorage("System", "Number", [])
    .readStorage("Balances", "TotalIssuance", []),
);
</script>

<template>
  <dl>
    <dt>Height</dt>
    <dd>{{ data[0].toLocaleString() }}</dd>

    <dt>Total issuance</dt>
    <dd>{{ data[1].toLocaleString() }}</dd>
  </dl>
</template>
