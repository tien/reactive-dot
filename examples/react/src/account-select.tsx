import type { WalletAccount } from "@reactive-dot/core/wallets.js";
import { useConnectedWallets, useAccounts } from "@reactive-dot/react";
import { type ReactNode, useState } from "react";

type AccountSelectProps = {
  children: (account: WalletAccount) => ReactNode;
};

export function AccountSelect({ children }: AccountSelectProps) {
  const connectedWallets = useConnectedWallets();
  const accounts = useAccounts();

  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const selectedAccount =
    selectedAccountIndex === undefined
      ? undefined
      : accounts.at(selectedAccountIndex);

  return (
    <div>
      {connectedWallets.length === 0 ? (
        <p>Please connect a wallet</p>
      ) : (
        <article>
          <h4>Signer</h4>
          <select
            value={selectedAccountIndex}
            onChange={(event) =>
              setSelectedAccountIndex(Number(event.target.value))
            }
          >
            {accounts.map((account, index) => (
              // eslint-disable-next-line @eslint-react/no-array-index-key
              <option key={index} value={index}>
                {account.name ?? account.address}
              </option>
            ))}
          </select>
        </article>
      )}
      {selectedAccount !== undefined && children(selectedAccount)}
    </div>
  );
}
