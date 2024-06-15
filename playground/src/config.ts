import { polkadot } from "@polkadot-api/descriptors";
import type { Config } from "@reactive-dot/core";
import { InjectedAggregator } from "@reactive-dot/core/wallets.js";
import { WebSocketProvider } from "polkadot-api/ws-provider/web";

const config: Config = {
  chains: {
    polkadot: {
      descriptor: polkadot,
      provider: WebSocketProvider("wss://polkadot-rpc.publicnode.com"),
    },
  },
  wallets: [new InjectedAggregator()],
};

export default config;
