import { kusama, polkadot, westend } from "@polkadot-api/descriptors";
import type { Config } from "@reactive-dot/core";
import { InjectedWalletAggregator } from "@reactive-dot/core/wallets.js";
import { getSmProvider } from "polkadot-api/sm-provider";
import { startFromWorker } from "polkadot-api/smoldot/from-worker";

const smoldotPromise = startFromWorker(
  new Worker(new URL("polkadot-api/smoldot/worker", import.meta.url), {
    type: "module",
  }),
);

export const config = {
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
    new InjectedWalletAggregator({ originName: "ReactiveDOT Vue Example" }),
  ],
} as const satisfies Config;
