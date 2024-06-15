import Playground from "./Playground.js";
import config from "./config.js";
import { ReDotChainProvider, ReDotProvider } from "@reactive-dot/react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const App = () => (
  <ReDotProvider config={config}>
    <ReDotChainProvider chainId="polkadot">
      <ErrorBoundary
        fallbackRender={() => (
          <article>
            <p>Sorry, something went wrong!</p>
          </article>
        )}
      >
        <Suspense fallback={<progress />}>
          <Playground />
        </Suspense>
      </ErrorBoundary>
    </ReDotChainProvider>
  </ReDotProvider>
);

export default App;
