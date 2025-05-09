<script setup lang="ts">
import AccountGuard from "./account-guard.vue";
import RemarkMutation from "./remark-mutation.vue";
</script>

<template>
  <section>
    <header>
      <h3>Mutation</h3>
    </header>
    <AccountGuard>
      <RemarkMutation />
    </AccountGuard>
  </section>
</template>
