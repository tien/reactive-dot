<script setup lang="ts">
import { useAccounts, useLazyLoadQuery } from "@reactive-dot/vue";

const { data: accounts } = await useAccounts();
const { data } = await useLazyLoadQuery((builder) =>
  builder
    .readStorage("System", "Number", [])
    .readStorage("Balances", "TotalIssuance", [])
    .readStorages(
      "System",
      "Account",
      accounts.value?.map((account) => [account.address] as const) ?? [],
    ),
);
</script>

<template>
  <section>
    <header>
      <h3>Query</h3>
    </header>
    <dl>
      <dt>Height</dt>
      <dd>{{ data[0].toLocaleString() }}</dd>

      <dt>Total issuance</dt>
      <dd>{{ data[1].toLocaleString() }}</dd>

      <div v-for="(balance, index) in data[2]">
        <dt>Balance of: {{ accounts?.at(index)?.address }}</dt>
        <dd>{{ balance.data.free.toLocaleString() }}</dd>
      </div>
    </dl>
  </section>
</template>
