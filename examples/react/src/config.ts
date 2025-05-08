import {
  contracts,
  kusama,
  kusama_asset_hub,
  polkadot,
  polkadot_asset_hub,
  polkadot_people,
  pop_testnet,
  westend,
  westend_asset_hub,
} from "@polkadot-api/descriptors";
import { defineConfig, defineContract } from "@reactive-dot/core";
import { createLightClientProvider } from "@reactive-dot/core/providers/light-client.js";
import { InjectedWalletProvider } from "@reactive-dot/core/wallets.js";
import { LedgerWallet } from "@reactive-dot/wallet-ledger";
import { MimirWalletProvider } from "@reactive-dot/wallet-mimir";
import { WalletConnect } from "@reactive-dot/wallet-walletconnect";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const lightClientProvider = createLightClientProvider();

const polkadotProvider = lightClientProvider.addRelayChain({ id: "polkadot" });

const kusamaProvider = lightClientProvider.addRelayChain({ id: "kusama" });

const westendProvider = lightClientProvider.addRelayChain({ id: "westend" });

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
      provider: kusamaProvider,
    },
    kusama_asset_hub: {
      descriptor: kusama_asset_hub,
      provider: kusamaProvider.addParachain({ id: "kusama_asset_hub" }),
    },
    westend: {
      descriptor: westend,
      provider: westendProvider,
    },
    westend_asset_hub: {
      descriptor: westend_asset_hub,
      provider: westendProvider.addParachain({ id: "westend_asset_hub" }),
    },
    pop_testnet: {
      descriptor: pop_testnet,
      provider: () => getWsProvider("wss://rpc2.paseo.popnetwork.xyz"),
    },
  },
  targetChains: ["polkadot", "kusama", "westend"],
  wallets: [
    new InjectedWalletProvider({ originName: "ReactiveDOT React Example" }),
    new MimirWalletProvider({ originName: "ReactiveDOT React Example" }),
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

export const psp22 = defineContract({ descriptor: contracts.psp22 });

export const flipper = defineContract({ descriptor: contracts.flipper });
