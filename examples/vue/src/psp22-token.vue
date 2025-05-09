<script setup lang="ts">
import { psp22 } from "./contracts";
import { useQuery } from "@reactive-dot/vue";
import { defineProps, toRefs } from "vue";

const { address } = defineProps<{
  address: string;
}>();

const { data } = await useQuery((builder) =>
  builder
    .storage("Timestamp", "Now")
    .contract(psp22, address, (builder) =>
      builder
        .message("PSP22Metadata::token_name")
        .message("PSP22Metadata::token_decimals")
        .message("PSP22Metadata::token_symbol")
        .message("PSP22::total_supply"),
    ),
);

const [timestamp, psp22Data] = toRefs(data.value);

const [tokenName, tokenDecimals, tokenSymbol, totalSupply] = toRefs(
  psp22Data.value,
);
</script>

<template>
  <article>
    <h3>PSP22</h3>
    <dl>
      <dt>Timestamp</dt>
      <dd>{{ new Date(Number(timestamp)).toLocaleString() }}</dd>

      <dt>Token name</dt>
      <dd>{{ tokenName ?? "N/A" }}</dd>

      <dt>Token symbol</dt>
      <dd>{{ tokenSymbol }}</dd>

      <dt>Token decimals</dt>
      <dd>{{ tokenDecimals }}</dd>

      <dt>Total supply</dt>
      <dd>{{ totalSupply.toLocaleString() }}</dd>
    </dl>
  </article>
</template>
