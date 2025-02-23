/* eslint-disable no-unexpected-multiline */
import { lazy } from "../../utils/lazy.js";
import {
  wellknownChains,
  type WellknownParachainId,
  type WellknownRelayChainId,
} from "./wellknown-chains.js";
import { getSmoldotExtensionProviders } from "@substrate/smoldot-discovery";
import { createClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { startFromWorker } from "polkadot-api/smoldot/from-worker";
import type { JsonRpcProvider } from "polkadot-api/ws-provider/web";

const getProviderSymbol = Symbol("getProvider");

export type LightClientProvider = {
  [getProviderSymbol]: () => Promise<JsonRpcProvider>;
};

type AddChainOptions<TWellknownChainId> =
  | { chainSpec: string }
  | { id: TWellknownChainId };

export function createLightClientProvider() {
  const getSmoldot = lazy(
    () =>
      getSmoldotExtensionProviders().at(0)?.provider ??
      startFromWorker(
        new Worker(new URL("polkadot-api/smoldot/worker", import.meta.url), {
          type: "module",
        }),
      ),
  );

  return {
    addRelayChain<TRelayChainId extends WellknownRelayChainId>(
      options: AddChainOptions<TRelayChainId>,
    ) {
      const getChainSpec = lazy(() =>
        "chainSpec" in options
          ? Promise.resolve(options.chainSpec)
          : wellknownChains[options.id][0]().then((chain) => chain.chainSpec),
      );

      const getRelayChain = lazy(() => {
        const smoldot = getSmoldot();

        return smoldot instanceof Promise
          ? smoldot.then(async (smoldot) =>
              smoldot.addChain(await getChainSpec()),
            )
          : getChainSpec().then((chainSpec) => smoldot.addChain({ chainSpec }));
      });

      return addLightClientProvider({
        async [getProviderSymbol]() {
          return getSmProvider(await getRelayChain());
        },

        addParachain<
          TParachainId extends
            keyof (typeof wellknownChains)[TRelayChainId][1] extends never
              ? WellknownParachainId
              : keyof (typeof wellknownChains)[TRelayChainId][1],
        >(options: AddChainOptions<TParachainId>) {
          return addLightClientProvider({
            async [getProviderSymbol]() {
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
                  : (() => {
                      const smoldot = getSmoldot();

                      return smoldot instanceof Promise
                        ? smoldot.then(async (smoldot) =>
                            smoldot.addChain(chainSpec),
                          )
                        : smoldot.addChain({
                            chainSpec,
                            potentialRelayChains: [relayChain],
                          });
                    })(),
              );

              return getSmProvider(await parachainPromise);
            },
          });
        },
      });
    },
  };
}

const lightClientProviders = new WeakSet<LightClientProvider>();

function addLightClientProvider<T extends LightClientProvider>(provider: T) {
  lightClientProviders.add(provider);
  return provider;
}

export function isLightClientProvider(
  value: unknown,
): value is LightClientProvider {
  return lightClientProviders.has(value as LightClientProvider);
}

export async function createClientFromLightClientProvider(
  provider: LightClientProvider,
) {
  return createClient(await provider[getProviderSymbol]());
}
