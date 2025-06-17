import { ChainProvider } from "../contexts/chain.js";
import { ReactiveDotProvider } from "../contexts/provider.js";
import { SignerProvider } from "../contexts/signer.js";
import { useContractMutation } from "./use-contract-mutation.js";
import {
  defineConfig,
  defineContract,
  idle,
  pending,
} from "@reactive-dot/core";
import { act, renderHook } from "@testing-library/react";
import { atom } from "jotai";
import type { PolkadotSigner, TxEvent } from "polkadot-api";
import { from, of, throwError } from "rxjs";
import { concatMap, delay } from "rxjs/operators";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mockSignSubmitAndWatch = vi.fn();

vi.mock("./use-typed-api.js", () => ({
  typedApiAtom: vi.fn(() => atom()),
}));

vi.mock("./use-ink-client.js", () => ({
  inkClientAtom: vi.fn(() => atom()),
}));

vi.mock(
  "@reactive-dot/core/internal/actions.js",
  async (getOriginalModule) => ({
    ...(await getOriginalModule()),
    getInkContractTx: vi.fn(async () => ({
      signSubmitAndWatch: mockSignSubmitAndWatch,
    })),
  }),
);

vi.useFakeTimers();

beforeEach(() =>
  mockSignSubmitAndWatch.mockReturnValue(
    from<Partial<TxEvent>[]>([
      { type: "signed" },
      { type: "broadcasted" },
      { type: "txBestBlocksState" },
      { type: "finalized" },
    ]).pipe(concatMap((item) => of(item).pipe(delay(1000)))),
  ),
);

afterEach(() => {
  vi.restoreAllMocks();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testContract = defineContract({ descriptor: {} as any });

it("sign submit and watch", async () => {
  const { result } = await act(() =>
    renderHook(
      () =>
        useContractMutation((mutate) =>
          mutate(testContract, "0x", "test_message", {}),
        ),
      {
        wrapper: ({ children }) => (
          <ReactiveDotProvider config={defineConfig({ chains: {} })}>
            <ChainProvider chainId="test_chain">
              <SignerProvider signer={{} as PolkadotSigner}>
                {children}
              </SignerProvider>
            </ChainProvider>
          </ReactiveDotProvider>
        ),
      },
    ),
  );

  expect(result.current[0]).toBe(idle);

  await act(() => result.current[1]());

  expect(result.current[0]).toBe(pending);

  await act(() => vi.advanceTimersByTime(1000));

  expect(result.current[0]).toMatchObject({ type: "signed" });

  await act(() => vi.advanceTimersByTime(1000));

  expect(result.current[0]).toMatchObject({ type: "broadcasted" });

  await act(() => vi.advanceTimersByTime(1000));

  expect(result.current[0]).toMatchObject({ type: "txBestBlocksState" });

  await act(() => vi.advanceTimersByTime(1000));

  expect(result.current[0]).toMatchObject({ type: "finalized" });
});

it("catches error", async () => {
  const { result } = await act(() =>
    renderHook(
      () =>
        useContractMutation((mutate) =>
          mutate(testContract, "0x", "test_message", {}),
        ),
      {
        wrapper: ({ children }) => (
          <ReactiveDotProvider config={defineConfig({ chains: {} })}>
            <ChainProvider chainId="test_chain">
              <SignerProvider signer={{} as PolkadotSigner}>
                {children}
              </SignerProvider>
            </ChainProvider>
          </ReactiveDotProvider>
        ),
      },
    ),
  );

  mockSignSubmitAndWatch.mockReturnValue(throwError(() => new Error("test")));

  expect(result.current[0]).toBe(idle);

  await act(() => result.current[1]());

  expect(result.current[0]).toBeInstanceOf(Error);
});
