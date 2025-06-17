import { chainIdKey, configKey, signerKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useContractMutation } from "./use-contract-mutation.js";
import { defineConfig, defineContract } from "@reactive-dot/core";
import type { TxEvent } from "polkadot-api";
import { from, of, throwError } from "rxjs";
import { concatMap, delay } from "rxjs/operators";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mockSignSubmitAndWatch = vi.fn();

vi.mock("./use-typed-api.js", () => ({
  useTypedApiPromise: vi.fn(),
}));

vi.mock("./use-ink-client.js", () => ({
  getInkClient: vi.fn(),
}));

vi.mock("@reactive-dot/core/internal/actions.js", () => ({
  getInkContractTx: vi.fn(async () => ({
    signSubmitAndWatch: mockSignSubmitAndWatch,
  })),
}));

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
  const { result } = withSetup(
    () =>
      useContractMutation((mutate) =>
        mutate(testContract, "0x", "test_message", {}),
      ),
    {
      [configKey]: defineConfig({ chains: {} }),
      [chainIdKey]: "test_chain",
      [signerKey]: {},
    },
  );

  expect(result.status.value).toBe("idle");

  result.execute();

  expect(result.status.value).toBe("pending");

  vi.advanceTimersByTime(1000);

  await vi.waitUntil(() => result.status.value === "success", {
    timeout: 3000,
  });

  expect(result.data.value).toMatchObject({ type: "signed" });

  vi.advanceTimersByTime(1000);

  expect(result.data.value).toMatchObject({ type: "broadcasted" });

  vi.advanceTimersByTime(1000);

  expect(result.data.value).toMatchObject({ type: "txBestBlocksState" });

  vi.advanceTimersByTime(1000);

  expect(result.data.value).toMatchObject({ type: "finalized" });
});

it("catches error", async () => {
  const { result } = withSetup(
    () =>
      useContractMutation((mutate) =>
        mutate(testContract, "0x", "test_message", {}),
      ),
    {
      [configKey]: defineConfig({ chains: {} }),
      [chainIdKey]: "test_chain",
      [signerKey]: {},
    },
  );

  mockSignSubmitAndWatch.mockReturnValue(throwError(() => new Error("test")));

  expect(result.status.value).toBe("idle");

  result.execute();

  await vi.waitUntil(() => result.status.value === "error", {
    timeout: 3000,
  });

  expect(result.error.value).toBeInstanceOf(Error);
});
