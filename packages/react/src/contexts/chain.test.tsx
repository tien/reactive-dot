import { ChainIdContext, ChainProvider } from "./chain.js";
import { render } from "@testing-library/react";
import { expect, it } from "vitest";

it("should provide chainId via context", () => {
  const chainId = 1;
  const { container } = render(
    <ChainProvider chainId={chainId}>
      <ChainIdContext.Consumer>
        {(value) => <div data-testid="value">{value}</div>}
      </ChainIdContext.Consumer>
    </ChainProvider>,
  );

  expect(container.textContent).toBe("1");
});

it("should render children", () => {
  const { container } = render(
    <ChainProvider chainId={1}>
      <div>Test Child</div>
    </ChainProvider>,
  );

  expect(container.textContent).toBe("Test Child");
});

it("should update context when chainId changes", () => {
  const { container, rerender } = render(
    <ChainProvider chainId={1}>
      <ChainIdContext.Consumer>
        {(value) => <div data-testid="value">{value}</div>}
      </ChainIdContext.Consumer>
    </ChainProvider>,
  );

  expect(container.textContent).toBe("1");

  rerender(
    <ChainProvider chainId={2}>
      <ChainIdContext.Consumer>
        {(value) => <div data-testid="value">{value}</div>}
      </ChainIdContext.Consumer>
    </ChainProvider>,
  );

  expect(container.textContent).toBe("2");
});
