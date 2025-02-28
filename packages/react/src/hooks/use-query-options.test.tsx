import { ChainIdContext } from "../contexts/chain.js";
import { useQueryOptions } from "./use-query-options.js";
import { Query, ReactiveDotError } from "@reactive-dot/core";
import { renderHook } from "@testing-library/react";
import { expect, it } from "vitest";

it("throws error when no chainId is provided", () => {
  const renderFunction = () =>
    renderHook(() => useQueryOptions((q: Query) => q));

  expect(renderFunction).toThrow(ReactiveDotError);
  expect(renderFunction).toThrow("No chain ID provided");
});

it("handles single query with context chainId", () => {
  const chainId = 1;
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChainIdContext value={chainId}>{children}</ChainIdContext>
  );

  const { result } = renderHook(() => useQueryOptions((q: Query) => q), {
    wrapper,
  });

  expect(result.current).toHaveLength(1);
  expect(result.current[0]?.chainId).toBe(chainId);
  expect(result.current[0]?.query).toBeInstanceOf(Query);
});

it("handles single query with explicit chainId", () => {
  const chainId = 1;
  const { result } = renderHook(() =>
    useQueryOptions((q: Query) => q, { chainId }),
  );

  expect(result.current).toHaveLength(1);
  expect(result.current[0]?.chainId).toBe(chainId);
  expect(result.current[0]?.query).toBeInstanceOf(Query);
});

it("handles multiple queries with different chainIds", () => {
  const options = [
    { chainId: 1, query: (q: Query) => q },
    { chainId: 2, query: (q: Query) => q },
  ];

  const { result } = renderHook(() => useQueryOptions(options));

  expect(result.current).toHaveLength(2);
  expect(result.current[0]?.chainId).toBe(1);
  expect(result.current[1]?.chainId).toBe(2);
  expect(result.current[0]?.query).toBeInstanceOf(Query);
  expect(result.current[1]?.query).toBeInstanceOf(Query);
});

it("handles Query instance directly", () => {
  const chainId = 1;
  const query = new Query();

  const { result } = renderHook(() => useQueryOptions(query, { chainId }));

  expect(result.current).toHaveLength(1);
  expect(result.current[0]?.chainId).toBe(chainId);
  expect(result.current[0]?.query).toBe(query);
});
