import { useWalletsInitializer } from "../hooks/use-wallets-initializer.js";
import { ConfigContext } from "./config.js";
import { type MutationEvent, MutationEventSubjectContext } from "./mutation.js";
import { ReactiveDotProvider } from "./provider.js";
import type { Config } from "@reactive-dot/core";
import { render, screen } from "@testing-library/react";
import type { Subject } from "rxjs";
import { beforeEach, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("../hooks/use-wallets-initializer", () => ({
  useWalletsInitializer: vi.fn(),
}));

const mockConfig = {
  chains: {},
  wallets: [],
} as Config;

const mockInitialize = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useWalletsInitializer).mockReturnValue([true, mockInitialize]);
});

it("should render children", () => {
  render(
    <ReactiveDotProvider config={mockConfig}>
      <div data-testid="child">Child content</div>
    </ReactiveDotProvider>,
  );

  expect(screen.getByTestId("child").textContent).toBe("Child content");
});

it("should provide config context", () => {
  let contextValue;

  render(
    <ReactiveDotProvider config={mockConfig}>
      <ConfigContext.Consumer>
        {(value) => {
          contextValue = value;
          return null;
        }}
      </ConfigContext.Consumer>
    </ReactiveDotProvider>,
  );

  expect(contextValue).toBe(mockConfig);
});

it("should provide mutation subject context", () => {
  let contextValue!: Subject<MutationEvent>;

  render(
    <ReactiveDotProvider config={mockConfig}>
      <MutationEventSubjectContext.Consumer>
        {(value) => {
          contextValue = value;
          return null;
        }}
      </MutationEventSubjectContext.Consumer>
    </ReactiveDotProvider>,
  );

  expect(contextValue).toBeDefined();
  expect(contextValue.subscribe).toBeDefined();
});

it("should call initialize on mount", () => {
  render(
    <ReactiveDotProvider config={mockConfig}>
      <div />
    </ReactiveDotProvider>,
  );

  expect(mockInitialize).toHaveBeenCalledTimes(1);
});
