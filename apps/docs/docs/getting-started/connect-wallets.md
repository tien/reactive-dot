---
sidebar_position: 3
---

# Connect wallets

Wallets & accounts connection can by managed via [`useWallets`](/api/react/function/useWallets), [`useConnectedWallets`](/api/react/function/useConnectedWallets) & [`useAccounts`](/api/react/function/useAccounts) hooks.

## Add wallets to the config

```ts title="config.ts"
import type { Config } from "@reactive-dot/core/types.js";
import {
  InjectedAggregator,
  WalletConnect,
} from "@reactive-dot/core/wallets.js";

const config: Config = {
  // ...
  wallets: [
    new InjectedAggregator(),
    new WalletConnect({
      projectId: "WALLET_CONNECT_PROJECT_ID",
      providerOptions: {
        metadata: {
          name: "APP_NAME",
          description: "APP_DESCRIPTION",
          url: "APP_URL",
          icons: ["APP_ICON"],
        },
      },
      chainIds: [
        // https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-13.md
        "polkadot:91b171bb158e2d3848fa23a9f1c25182", // Polkadot
        // ...
      ],
    }),
  ],
};

export default config;
```

## Connect to wallets

```tsx title="Wallets.tsx"
import { useConnectedWallets, useWallets } from "@reactive-dot/react";

const Wallets = () => {
  const wallets = useWallets();
  const connectedWallets = useConnectedWallets();

  return (
    <section>
      <header>
        <h3>Wallet connection</h3>
      </header>
      <article>
        <h4>Wallets</h4>
        <ul>
          {wallets.map((wallet) => (
            <li key={wallet.id}>
              <div>{wallet.name}</div>
              <div>
                {connectedWallets.includes(wallet) ? (
                  <button onClick={() => wallet.disconnect()}>
                    Disconnect
                  </button>
                ) : (
                  <button onClick={() => wallet.connect()}>Connect</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export default Wallet;
```

## Display available accounts

```tsx title="Accounts.tsx"
import { useAccounts } from "@reactive-dot/react";

const Accounts = () => {
  const accounts = useAccounts();

  return (
    <section>
      <header>
        <h3>Accounts</h3>
      </header>
      <ul>
        {accounts.map((account, index) => (
          <li key={index}>
            <div>{account.address}</div>
            <div>{account.name}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Accounts;
```
