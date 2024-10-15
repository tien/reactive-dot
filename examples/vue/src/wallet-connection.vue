<script setup lang="ts">
import {
  useConnectedWallets,
  useWalletConnector,
  useWalletDisconnector,
  useWallets,
} from "@reactive-dot/vue";

const { data: wallets } = await useWallets();
const { data: connectedWallets } = await useConnectedWallets();
const { execute: connect, status: connectStatus } = useWalletConnector();
const { execute: disconnect, status: disconnectStatus } =
  useWalletDisconnector();
</script>

<template>
  <section>
    <h3>Wallet connection</h3>
  </section>
  <article>
    <h4>Wallets</h4>
    <ul>
      <li v-for="wallet in wallets">
        {{ wallet.name }}:
        <button
          v-if="!connectedWallets.includes(wallet)"
          @click="connect(wallet)"
          :disabled="
            connectStatus === 'pending' || disconnectStatus === 'pending'
          "
        >
          Connect
        </button>
        <button
          v-if="connectedWallets.includes(wallet)"
          @click="disconnect(wallet)"
          :disabled="
            connectStatus === 'pending' || disconnectStatus === 'pending'
          "
        >
          Disconnect
        </button>
      </li>
    </ul>
  </article>
</template>
