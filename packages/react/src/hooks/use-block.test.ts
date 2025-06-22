import { bestBlockAtom, finalizedBlockAtom, useBlock } from "./use-block.js";
import { internal_useChainId } from "./use-chain-id.js";
import { useConfig } from "./use-config.js";
import { usePausableAtomValue } from "./use-pausable-atom-value.js";
import { renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

vi.mock("./use-config.js");
vi.mock("./use-chain-id.js");
vi.mock("./use-pausable-atom-value.js");

const mockConfig = { chains: {} };
const mockChainId = "test-chain";
const mockAtomValue = { hash: "0x123", number: 100 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useConfig).mockReturnValue(mockConfig);
  vi.mocked(internal_useChainId).mockReturnValue(mockChainId);
  vi.mocked(usePausableAtomValue).mockReturnValue(mockAtomValue);
});

it("should use finalized block atom by default", () => {
  renderHook(() => useBlock());

  expect(useConfig).toHaveBeenCalled();
  expect(internal_useChainId).toHaveBeenCalledWith(undefined);
  expect(usePausableAtomValue).toHaveBeenCalledWith(
    finalizedBlockAtom(mockConfig, mockChainId),
  );
});

it('should use finalized block atom when tag is "finalized"', () => {
  renderHook(() => useBlock("finalized"));

  expect(usePausableAtomValue).toHaveBeenCalledWith(
    finalizedBlockAtom(mockConfig, mockChainId),
  );
});

it('should use best block atom when tag is "best"', () => {
  renderHook(() => useBlock("best"));

  expect(usePausableAtomValue).toHaveBeenCalledWith(
    bestBlockAtom(mockConfig, mockChainId),
  );
});

it("should pass options to internal_useChainId", () => {
  const options = { chainId: "custom-chain" };
  renderHook(() => useBlock("finalized", options));

  expect(internal_useChainId).toHaveBeenCalledWith(options);
});

it("should return the value from usePausableAtomValue", () => {
  const { result } = renderHook(() => useBlock());

  expect(result.current).toBe(mockAtomValue);
});
