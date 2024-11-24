import { kusama, polkadot, westend } from "@polkadot-api/descriptors";
import { defineConfig } from "@reactive-dot/core";
import { InjectedWalletProvider } from "@reactive-dot/core/wallets.js";
import { LedgerWallet } from "@reactive-dot/wallet-ledger";
import { WalletConnect } from "@reactive-dot/wallet-walletconnect";
import { getSmProvider } from "polkadot-api/sm-provider";
import { startFromWorker } from "polkadot-api/smoldot/from-worker";

const smoldot = startFromWorker(
  new Worker(new URL("polkadot-api/smoldot/worker", import.meta.url), {
    type: "module",
  }),
);

export const config = defineConfig({
  chains: {
    polkadot: {
      descriptor: polkadot,
      provider: getSmProvider(
        import("polkadot-api/chains/polkadot").then(({ chainSpec }) =>
          smoldot.addChain({ chainSpec }),
        ),
      ),
    },
    kusama: {
      descriptor: kusama,
      provider: getSmProvider(
        import("polkadot-api/chains/ksmcc3").then(({ chainSpec }) =>
          smoldot.addChain({ chainSpec }),
        ),
      ),
    },
    westend: {
      descriptor: westend,
      provider: getSmProvider(
        import("polkadot-api/chains/westend2").then(({ chainSpec }) =>
          smoldot.addChain({ chainSpec }),
        ),
      ),
    },
  },
  wallets: [
    new InjectedWalletProvider({ originName: "ReactiveDOT React Example" }),
    new LedgerWallet(),
    new WalletConnect({
      projectId: "68f5b7e972a51cf379b127f51a791c34",
      providerOptions: {
        metadata: {
          name: "ReactiveDOT example",
          description: "Simple React App showcasing ReactiveDOT",
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
});
