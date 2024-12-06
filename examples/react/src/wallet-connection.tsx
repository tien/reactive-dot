import { pending } from "@reactive-dot/core";
import type { Wallet } from "@reactive-dot/core/wallets.js";
import {
  useConnectedWallets,
  useWalletConnector,
  useWalletDisconnector,
  useWallets,
} from "@reactive-dot/react";
import { use } from "react";

export function WalletConnection() {
  const wallets = use(useWallets());

  return (
    <section>
      <header>
        <h3>Wallet connection</h3>
      </header>
      <article>
        <h4>Wallets</h4>
        <ul>
          {wallets.map((wallet) => (
            <WalletItem key={wallet.id} wallet={wallet} />
          ))}
        </ul>
      </article>
    </section>
  );
}

type WalletItemProps = {
  wallet: Wallet;
};

function WalletItem({ wallet }: WalletItemProps) {
  const connectedWallets = use(useConnectedWallets());

  const [connectingState, connect] = useWalletConnector(wallet);
  const [disconnectingState, disconnect] = useWalletDisconnector(wallet);

  return (
    <li>
      {wallet.name}:{" "}
      {connectedWallets.includes(wallet) ? (
        <button
          type="button"
          onClick={() => disconnect()}
          disabled={disconnectingState === pending}
        >
          Disconnect{disconnectingState === pending && <>...</>}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => connect()}
          disabled={connectingState === pending}
        >
          Connect{connectingState === pending && <>...</>}
        </button>
      )}
    </li>
  );
}
