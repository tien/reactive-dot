import { idle, pending, MutationError } from "@reactive-dot/core";
import {
  useConnectedWallets,
  useAccounts,
  useMutation,
} from "@reactive-dot/react";
import { Binary } from "polkadot-api";
import { useState } from "react";

export function Mutation() {
  const connectedWallets = useConnectedWallets();

  const accounts = useAccounts();
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const selectedAccount =
    selectedAccountIndex === undefined
      ? undefined
      : accounts.at(selectedAccountIndex);

  const [remarkState, remark] = useMutation(
    (tx) =>
      tx.System.remark({ remark: Binary.fromText("Hello from reactive-dot!") }),
    { signer: selectedAccount?.polkadotSigner },
  );

  return (
    <section>
      <header>
        <h3>Mutation</h3>
      </header>
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
      {connectedWallets.length === 0 ? null : selectedAccount === undefined ? (
        <p>Please select an account</p>
      ) : (
        <article>
          <h4>Remark</h4>
          <button type="button" onClick={() => remark()}>
            Hello
          </button>
          <p>
            {(() => {
              switch (remarkState) {
                case idle:
                  return null;
                case pending:
                  return "Submitting transaction...";
                default:
                  if (remarkState instanceof MutationError) {
                    return "Error submitting transaction";
                  }

                  return (
                    <span>
                      Submitted tx {remarkState.txHash} is {remarkState.type}
                    </span>
                  );
              }
            })()}
          </p>
        </article>
      )}
    </section>
  );
}
