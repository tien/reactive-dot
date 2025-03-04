import {
  createClientFromLightClientProvider,
  createLightClientProvider,
  isLightClientProvider,
  type LightClientProvider,
} from "./provider.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("polkadot-api", () => ({
  createClient: vi.fn().mockReturnValue({ mockClient: true }),
}));

vi.mock("polkadot-api/sm-provider", () => ({
  getSmProvider: vi.fn().mockImplementation((chain) => ({
    provider: true,
    chain,
  })),
}));

vi.mock("./wellknown-chains.js", () => ({
  wellknownChains: {
    polkadot: [
      vi.fn().mockResolvedValue({ chainSpec: "polkadot-spec" }),
      {
        polkadot_asset_hub: vi
          .fn()
          .mockResolvedValue({ chainSpec: "asset-hub-spec" }),
      },
    ],
    kusama: [
      vi.fn().mockResolvedValue({ chainSpec: "kusama-spec" }),
      {
        polkadot_asset_hub: vi
          .fn()
          .mockResolvedValue({ chainSpec: "asset-hub-kusama-spec" }),
      },
    ],
  },
}));

global.Worker = class {
  constructor() {}
  postMessage = vi.fn();
  addEventListener = vi.fn();
} as unknown as typeof Worker;

// Mock smoldot imports
vi.mock("polkadot-api/smoldot/from-worker", () => ({
  startFromWorker: vi.fn().mockResolvedValue({
    addChain: vi.fn().mockImplementation(({ chainSpec }) => ({
      chainId: "chain-id",
      chainSpec,
    })),
  }),
}));

vi.mock("@substrate/smoldot-discovery", () => ({
  getSmoldotExtensionProviders: vi.fn().mockReturnValue([
    {
      provider: {
        addChain: vi.fn().mockImplementation((chainSpec) => ({
          chainId: "sc-chain-id",
          chainSpec,
        })),
      },
    },
  ]),
}));

describe("Light Client Provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a light client provider without substrate connect", async () => {
    const provider = createLightClientProvider();

    expect(provider).toBeDefined();
    expect(provider.addRelayChain).toBeInstanceOf(Function);
  });

  it("should create a light client provider with substrate connect enabled", async () => {
    const provider = createLightClientProvider({
      useExtensionProvider: true,
    });

    expect(provider).toBeDefined();
    expect(provider.addRelayChain).toBeInstanceOf(Function);
  });

  it("should add relay chain with chain spec", async () => {
    const provider = createLightClientProvider();
    const relayChain = provider.addRelayChain({ chainSpec: "test-chain-spec" });

    expect(relayChain).toBeDefined();
    expect(isLightClientProvider(relayChain)).toBeTruthy();
  });

  it("should add relay chain with wellknown id", async () => {
    const provider = createLightClientProvider();
    const relayChain = provider.addRelayChain({ id: "polkadot" });

    expect(relayChain).toBeDefined();
    expect(isLightClientProvider(relayChain)).toBeTruthy();
  });

  it("should add parachain to relay chain", async () => {
    const provider = createLightClientProvider();
    const relayChain = provider.addRelayChain({ id: "polkadot" });
    const parachain = relayChain.addParachain({ id: "polkadot_asset_hub" });

    expect(parachain).toBeDefined();
    expect(isLightClientProvider(parachain)).toBeTruthy();
  });

  it("should add parachain with chain spec to relay chain", async () => {
    const provider = createLightClientProvider();
    const relayChain = provider.addRelayChain({ id: "polkadot" });
    const parachain = relayChain.addParachain({ chainSpec: "parachain-spec" });

    expect(parachain).toBeDefined();
    expect(isLightClientProvider(parachain)).toBeTruthy();
  });

  it("should identify light client providers correctly", () => {
    const provider = createLightClientProvider();
    const relayChain = provider.addRelayChain({ id: "polkadot" });

    expect(isLightClientProvider(relayChain)).toBeTruthy();
    expect(isLightClientProvider({})).toBeFalsy();
    expect(isLightClientProvider(null)).toBeFalsy();
    expect(isLightClientProvider(undefined)).toBeFalsy();
  });

  it("should create client from light client provider", () => {
    const provider = createLightClientProvider();
    const relayChain = provider.addRelayChain({ id: "polkadot" });
    const client = createClientFromLightClientProvider(
      relayChain as LightClientProvider,
    );

    expect(client).toEqual({ mockClient: true });
  });
});
