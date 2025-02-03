import {
  createLightClientProvider,
  isLightClientProvider,
  createClientFromLightClientProvider,
} from "./provider.js";
import { it, expect, beforeEach, vi } from "vitest";

// Create fake implementations for dependencies

const fakeSmoldot = {
  addChain: vi.fn((chain: string | { chainSpec: string }) =>
    Promise.resolve({ chainSpec: chain, id: "added" }),
  ),
};

// Mock @substrate/smoldot-discovery to return a fake smoldot provider
vi.mock("@substrate/smoldot-discovery", () => ({
  getSmoldotExtensionProviders: () => [
    { provider: Promise.resolve(fakeSmoldot) },
  ],
}));

// Mock polkadot-api/sm-provider to wrap chains in a fake provider
vi.mock("polkadot-api/sm-provider", () => ({
  getSmProvider: vi.fn((chain) => Promise.resolve({ clientChain: chain })),
}));

// Mock polkadot-api to return a fake client with the provided provider
vi.mock("polkadot-api", () => ({
  createClient: vi.fn((provider) => ({ sm_client: provider })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it("should create a relay chain provider with chainSpec", async () => {
  const lightClient = createLightClientProvider();
  const relayProvider = lightClient.addRelayChain({
    chainSpec: "fakeRelayChainSpec",
  });

  const client = await createClientFromLightClientProvider(relayProvider);

  // Expect the fake sm-provider to have been called with the result of smoldot.addChain.
  expect(client).toEqual({
    sm_client: {
      clientChain: { chainSpec: "fakeRelayChainSpec", id: "added" },
    },
  });
  expect(fakeSmoldot.addChain).toHaveBeenCalledWith("fakeRelayChainSpec");
});

it("should create a parachain provider with chainSpec", async () => {
  const lightClient = createLightClientProvider();
  const relayProvider = lightClient.addRelayChain({
    chainSpec: "fakeRelayChainSpec",
  });
  const parachainProvider = relayProvider.addParachain({
    chainSpec: "fakeParachainSpec",
  });

  const client = await createClientFromLightClientProvider(parachainProvider);

  // Expect the parachain chain addition to use its own chainSpec.
  expect(client).toEqual({
    sm_client: {
      clientChain: { chainSpec: "fakeParachainSpec", id: "added" },
    },
  });
  expect(fakeSmoldot.addChain).toHaveBeenCalledTimes(2);
});

it("should recognize a valid LightClientProvider", () => {
  const lightClient = createLightClientProvider();
  const relayProvider = lightClient.addRelayChain({
    chainSpec: "fakeRelayChainSpec",
  });
  const nonProvider = {};

  expect(isLightClientProvider(relayProvider)).toBe(true);
  expect(isLightClientProvider(nonProvider)).toBe(false);
});
