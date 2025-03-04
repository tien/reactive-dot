/* eslint-disable no-unexpected-multiline */
import { lazy } from "../../utils/lazy.js";
import {
  wellknownChains,
  type WellknownParachainId,
  type WellknownRelayChainId,
} from "./wellknown-chains.js";
import type { getSmoldotExtensionProviders } from "@substrate/smoldot-discovery";
import { createClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import type { JsonRpcProvider } from "polkadot-api/ws-provider/web";

const getProviderSymbol = Symbol("getProvider");

export type LightClientProvider = {
  [getProviderSymbol]: () => JsonRpcProvider;
};

type AddChainOptions<TWellknownChainId> =
  | { chainSpec: string }
  | { id: TWellknownChainId };

type LightClientOptions = {
  /**
   * Connect to the first available {@link https://github.com/paritytech/substrate-connect | Substrate Connect} provider.
   */
  useExtensionProvider?: boolean;
};

export function createLightClientProvider({
  useExtensionProvider = true,
}: LightClientOptions = {}) {
  const getSmoldot = lazy(async () => {
    if (!useExtensionProvider) {
      return startSmoldotWorker();
    }

    return (await startSubstrateConnectWorker()) ?? startSmoldotWorker();
  });

  return {
    addRelayChain<TRelayChainId extends WellknownRelayChainId>(
      options: AddChainOptions<TRelayChainId>,
    ) {
      const getChainSpec = lazy(() =>
        "chainSpec" in options
          ? Promise.resolve(options.chainSpec)
          : wellknownChains[options.id][0]().then((chain) => chain.chainSpec),
      );

      const getRelayChain = lazy(async () => {
        const smoldot = await getSmoldot();
        const chainSpec = await getChainSpec();

        if (isSubstrateConnectProvider(smoldot)) {
          return smoldot.addChain(chainSpec);
        }

        return smoldot.addChain({ chainSpec });
      });

      return addLightClientProvider({
        [getProviderSymbol]() {
          return getSmProvider(getRelayChain());
        },

        addParachain<
          TParachainId extends
            keyof (typeof wellknownChains)[TRelayChainId][1] extends never
              ? WellknownParachainId
              : keyof (typeof wellknownChains)[TRelayChainId][1],
        >(options: AddChainOptions<TParachainId>) {
          return addLightClientProvider({
            [getProviderSymbol]() {
              const chainSpecPromise =
                "chainSpec" in options
                  ? Promise.resolve(options.chainSpec)
                  : // @ts-expect-error TODO: fix this
                    Object.fromEntries(
                      Object.values(wellknownChains).flatMap((relayChain) =>
                        Object.entries(relayChain[1]),
                      ),
                    )
                      [options.id]()
                      .then((chain) => chain.chainSpec);

              const parachainPromise = Promise.all([
                getRelayChain(),
                chainSpecPromise,
              ]).then(([relayChain, chainSpec]) =>
                "addChain" in relayChain
                  ? relayChain.addChain(chainSpec)
                  : (async () => {
                      const smoldot = await getSmoldot();

                      return isSubstrateConnectProvider(smoldot)
                        ? smoldot.addChain(chainSpec)
                        : smoldot.addChain({
                            chainSpec,
                            potentialRelayChains: [relayChain],
                          });
                    })(),
              );

              return getSmProvider(parachainPromise);
            },
          });
        },
      });
    },
  };
}

export function isLightClientProvider(
  value: unknown,
): value is LightClientProvider {
  return lightClientProviders.has(value as LightClientProvider);
}

export function createClientFromLightClientProvider(
  provider: LightClientProvider,
) {
  return createClient(provider[getProviderSymbol]());
}

const lightClientProviders = new WeakSet<LightClientProvider>();

function addLightClientProvider<T extends LightClientProvider>(provider: T) {
  lightClientProviders.add(provider);
  return provider;
}

function startSmoldotWorker() {
  return import("polkadot-api/smoldot/from-worker").then(
    ({ startFromWorker }) =>
      startFromWorker(
        new Worker(new URL("polkadot-api/smoldot/worker", import.meta.url), {
          type: "module",
        }),
      ),
  );
}

const substrateConnectSet = new WeakSet<
  Awaited<ReturnType<typeof getSmoldotExtensionProviders>[number]["provider"]>
>();

function startSubstrateConnectWorker() {
  return import("@substrate/smoldot-discovery").then(
    async ({ getSmoldotExtensionProviders }) => {
      const provider = await getSmoldotExtensionProviders().at(0)?.provider;

      if (provider !== undefined) {
        substrateConnectSet.add(provider);
      }

      return provider;
    },
  );
}

function isSubstrateConnectProvider(
  value: unknown,
): value is Awaited<
  ReturnType<typeof getSmoldotExtensionProviders>[number]["provider"]
> {
  return substrateConnectSet.has(value as never);
}
