import type { ChainConfig } from "../config.js";
import {
  createClientFromLightClientProvider,
  isLightClientProvider,
} from "../providers/light-client/provider.js";
import { getClient } from "./get-client.js";
import { createClient } from "polkadot-api";
import { beforeEach, expect, it, vi } from "vitest";

const fakeLightClient = { isLight: true };

const fakeRpcProvider = { isRpc: true };

type FakeProvider = typeof fakeLightClient | typeof fakeRpcProvider;

// Setup mocks before importing the module under test
vi.mock("../providers/light-client/provider.js", () => ({
  isLightClientProvider: vi.fn(
    (provider: FakeProvider) => "isLight" in provider && provider.isLight,
  ),
  createClientFromLightClientProvider: vi.fn((provider: FakeProvider) => ({
    client: "light",
    provider,
  })),
}));

vi.mock("polkadot-api", () => ({
  createClient: vi.fn((provider: FakeProvider) => ({
    client: "rpc",
    provider,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it("should use createClientFromLightClientProvider when provider is a light client object", async () => {
  const chainConfig = {
    provider: Promise.resolve(fakeLightClient),
  } as unknown as ChainConfig;
  const client = await getClient(chainConfig);

  expect(isLightClientProvider).toHaveBeenCalledWith(fakeLightClient);
  expect(createClientFromLightClientProvider).toHaveBeenCalledWith(
    fakeLightClient,
  );
  expect(client).toEqual({ client: "light", provider: fakeLightClient });
});

it("should use createClient when provider is a function with parameters (non-light client)", async () => {
  // Function with length > 0; using dummy parameter to simulate RPC provider.
  function rpcProvider(_: unknown) {}
  // Ensure it's not detected as light client.
  const chainConfig = {
    provider: Promise.resolve(rpcProvider),
  } as unknown as ChainConfig;
  const client = await getClient(chainConfig);

  expect(isLightClientProvider).toHaveBeenCalledWith(rpcProvider);
  expect(createClient).toHaveBeenCalledWith(rpcProvider);
  expect(client).toEqual({ client: "rpc", provider: rpcProvider });
});

it("should execute a zero-argument provider function and use createClientFromLightClientProvider when result is a light client", async () => {
  const getter = () => fakeLightClient;
  // Zero-argument function has length 0.
  const chainConfig = {
    provider: Promise.resolve(getter),
  } as unknown as ChainConfig;
  const client = await getClient(chainConfig);

  expect(isLightClientProvider).toHaveBeenCalledWith(fakeLightClient);
  expect(createClientFromLightClientProvider).toHaveBeenCalledWith(
    fakeLightClient,
  );
  expect(client).toEqual({ client: "light", provider: fakeLightClient });
});

it("should execute a zero-argument provider function and use createClient when result is a RPC provider", async () => {
  const getter = () => fakeRpcProvider;
  const chainConfig = {
    provider: Promise.resolve(getter),
  } as unknown as ChainConfig;
  const client = await getClient(chainConfig);

  expect(isLightClientProvider).toHaveBeenCalledWith(fakeRpcProvider);
  expect(createClient).toHaveBeenCalledWith(fakeRpcProvider);
  expect(client).toEqual({ client: "rpc", provider: fakeRpcProvider });
});
