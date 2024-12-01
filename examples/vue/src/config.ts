import {
  kusama,
  polkadot,
  polkadot_asset_hub,
  polkadot_people,
  westend,
} from "@polkadot-api/descriptors";
import { defineConfig } from "@reactive-dot/core";
import { createLightClientProvider } from "@reactive-dot/core/providers/light-client.js";
import { InjectedWalletProvider } from "@reactive-dot/core/wallets.js";
import { LedgerWallet } from "@reactive-dot/wallet-ledger";
import { WalletConnect } from "@reactive-dot/wallet-walletconnect";

const lightClientProvider = createLightClientProvider();

const polkadotProvider = lightClientProvider.addRelayChain({ id: "polkadot" });

export const config = defineConfig({
  chains: {
    polkadot: {
      descriptor: polkadot,
      provider: polkadotProvider,
    },
    polkadot_asset_hub: {
      descriptor: polkadot_asset_hub,
      provider: polkadotProvider.addParachain({ id: "polkadot_asset_hub" }),
    },
    polkadot_people: {
      descriptor: polkadot_people,
      provider: polkadotProvider.addParachain({ id: "polkadot_people" }),
    },
    kusama: {
      descriptor: kusama,
      provider: lightClientProvider.addRelayChain({ id: "kusama" }),
    },
    westend: {
      descriptor: westend,
      provider: lightClientProvider.addRelayChain({ id: "westend" }),
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
