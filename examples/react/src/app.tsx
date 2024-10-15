import { config } from "./config";
import { Mutation } from "./mutation";
import { Query } from "./query";
import { WalletConnection } from "./wallet-connection";
import { MutationError, pending } from "@reactive-dot/core";
import {
  ChainProvider,
  ReactiveDotProvider,
  useMutationEffect,
  useQueryErrorResetter,
} from "@reactive-dot/react";
import { DevTools } from "jotai-devtools";
import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import toast, { Toaster } from "react-hot-toast";

export function App() {
  return (
    <ReactiveDotProvider config={config}>
      <Suspense fallback="Loading wallet connection...">
        <WalletConnection />
      </Suspense>
      <ChainProvider chainId="polkadot">
        <Example chainName="Polkadot" />
      </ChainProvider>
      <ChainProvider chainId="kusama">
        <Example chainName="Kusama" />
      </ChainProvider>
      <ChainProvider chainId="westend">
        <Example chainName="Westend" />
      </ChainProvider>
      <Toaster />
      <DevTools />
    </ReactiveDotProvider>
  );
}

type ExampleProps = { chainName: string };

function Example({ chainName }: ExampleProps) {
  const resetQueryError = useQueryErrorResetter();

  useMutationEffect((event) => {
    if (event.value === pending) {
      toast.loading("Submitting transaction", { id: event.id });
      return;
    }

    if (event.value instanceof MutationError) {
      toast.error("Failed to submit transaction", { id: event.id });
      return;
    }

    switch (event.value.type) {
      case "finalized":
        if (event.value.ok) {
          toast.success("Submitted transaction", { id: event.id });
        } else {
          toast.error("Transaction failed", { id: event.id });
        }
        break;
      default:
        toast.loading("Transaction pending", { id: event.id });
    }
  });

  return (
    <div>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={(details) => {
          if (details.reason === "imperative-api") {
            const [error] = details.args;
            resetQueryError(error);
          }
        }}
      >
        <Suspense fallback={<h2>Loading {chainName}...</h2>}>
          <h2>{chainName}</h2>
          <Query />
          <Mutation />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <article>
      <header>
        <strong>Oops, something went wrong!</strong>
      </header>
      <button type="button" onClick={() => resetErrorBoundary(error)}>
        Retry
      </button>
    </article>
  );
}
