import { kusama, polkadot, westend } from "@polkadot-api/descriptors";
import type { Config } from "@reactive-dot/core";
import {
  InjectedAggregator,
  WalletConnect,
} from "@reactive-dot/core/wallets.js";
import { getSmProvider } from "polkadot-api/sm-provider";
import { startFromWorker } from "polkadot-api/smoldot/from-worker";

const smoldotPromise = startFromWorker(
  new Worker(new URL("polkadot-api/smoldot/worker", import.meta.url), {
    type: "module",
  }),
);

const config: Config = {
  chains: {
    polkadot: {
      descriptor: polkadot,
      provider: getSmProvider(
        import("polkadot-api/chains/polkadot").then(({ chainSpec }) =>
          smoldotPromise.addChain({ chainSpec }),
        ),
      ),
    },
    kusama: {
      descriptor: kusama,
      provider: getSmProvider(
        import("polkadot-api/chains/ksmcc3").then(({ chainSpec }) =>
          smoldotPromise.addChain({ chainSpec }),
        ),
      ),
    },
    westend: {
      descriptor: westend,
      provider: getSmProvider(
        import("polkadot-api/chains/westend2").then(({ chainSpec }) =>
          smoldotPromise.addChain({ chainSpec }),
        ),
      ),
    },
  },
  wallets: [
    new InjectedAggregator(),
    new WalletConnect({
      projectId: "68f5b7e972a51cf379b127f51a791c34",
      providerOptions: {
        metadata: {
          name: "Reactive DOT example",
          description: "Simple React App showcasing Reactive DOT",
          url: globalThis.location.origin,
          icons: ["https://walletconnect.com/walletconnect-logo.png"],
        },
      },
      chainIds: [
        "polkadot:91b171bb158e2d3848fa23a9f1c25182", // Polkadot
        "polkadot:b0a8d493285c2df73290dfb7e61f870f", // Kusama
        "polkadot:e143f23803ac50e8f6f8e62695d1ce9e", // Westend
      ],
    }),
  ],
};

export default config;
