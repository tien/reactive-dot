import { SignerContext, SignerProvider } from "./signer.js";
import { render } from "@testing-library/react";
import type { PolkadotSigner } from "polkadot-api";
import { use } from "react";
import { expect, it } from "vitest";

it("should provide signer value to children", () => {
  const mockSigner = {} as unknown as PolkadotSigner;

  function TestComponent() {
    const signer = use(SignerContext);
    return <div data-testid="test">{signer ? "has-signer" : "no-signer"}</div>;
  }

  const { getByTestId } = render(
    <SignerProvider signer={mockSigner}>
      <TestComponent />
    </SignerProvider>,
  );

  expect(getByTestId("test").textContent).toBe("has-signer");
});

it("should handle undefined signer", () => {
  function TestComponent() {
    const signer = use(SignerContext);
    return <div data-testid="test">{signer ? "has-signer" : "no-signer"}</div>;
  }

  const { getByTestId } = render(
    <SignerProvider signer={undefined}>
      <TestComponent />
    </SignerProvider>,
  );

  expect(getByTestId("test").textContent).toBe("no-signer");
});
