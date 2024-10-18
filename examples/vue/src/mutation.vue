<script setup lang="ts">
import { useAccounts, useMutation } from "@reactive-dot/vue";
import { Binary } from "polkadot-api";
import { computed, ref } from "vue";

const { data: accounts } = await useAccounts();

const selectedAccountIndex = ref(0);
const selectedAccount = computed(() =>
  accounts.value.at(selectedAccountIndex.value),
);

const { execute, data, status } = useMutation(
  (tx) =>
    tx.System.remark({ remark: Binary.fromText("Hello from reactive-dot!") }),
  { signer: computed(() => selectedAccount.value?.polkadotSigner) },
);
</script>

<template>
  <section>
    <header>
      <h3>Mutation</h3>
    </header>
    <article>
      <header><h4>Signer</h4></header>
      <p v-if="accounts.length === 0">Please connect a wallet</p>
      <select v-else v-model="selectedAccountIndex">
        <option v-for="(account, index) in accounts" :value="index">
          {{ account.name ?? account.address }}
        </option>
      </select>
    </article>
    <template v-if="accounts.length > 0">
      <p v-if="selectedAccount === undefined">Please select an account</p>
      <article v-else>
        <header><h4>Remark</h4></header>
        <button @click="execute()">Hello</button>
        <p v-if="status === 'pending'">Submitting transaction...</p>
        <p v-else-if="status === 'error'">Error submitting transaction</p>
        <p v-else-if="status === 'success'">
          Submitted tx {{ data?.txHash }} is {{ data?.type }}
        </p>
      </article></template
    >
  </section>
</template>
