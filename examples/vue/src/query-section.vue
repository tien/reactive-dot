<script setup lang="ts">
import {
  useAccounts,
  useNativeToken,
  useQuery,
  useSpendableBalance,
} from "@reactive-dot/vue";
import { computed } from "vue";

const { data: nativeToken } = await useNativeToken();
const { data: accounts } = await useAccounts();

const { data } = await useQuery((builder) =>
  builder
    .storage("System", "Number", [])
    .storage("Balances", "TotalIssuance", []),
);

const totalIssuance = computed(() =>
  nativeToken.value.amountFromPlanck(data.value[1]),
);

const { data: balances } = await useSpendableBalance(
  computed(() => accounts.value.map((account) => account.address)),
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
      <dd>{{ totalIssuance.toLocaleString() }}</dd>

      <div v-for="(balance, index) in balances" :key="index">
        <dt>Balance of: {{ accounts.at(index)?.address }}</dt>
        <dd>{{ balance.toLocaleString() }}</dd>
      </div>
    </dl>
  </section>
</template>
