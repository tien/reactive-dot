<script setup lang="ts">
import { provideSigner, useAccounts } from "@reactive-dot/vue";
import { computed, ref } from "vue";

const { data: accounts } = await useAccounts();

const selectedAccountIndex = ref(0);
const selectedAccount = computed(() =>
  accounts.value.at(selectedAccountIndex.value),
);

provideSigner(computed(() => selectedAccount.value!.polkadotSigner));
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
        <option
          v-for="(account, index) in accounts"
          :key="account.id"
          :value="index"
        >
          {{ account.name ?? account.address }}
        </option>
      </select>
    </article>
    <template v-if="accounts.length > 0">
      <p v-if="selectedAccount === undefined">Please select an account</p>
      <slot v-else />
    </template>
  </section>
</template>
