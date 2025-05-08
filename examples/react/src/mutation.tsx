import { AccountSelect } from "./account-select";
import { idle, MutationError, pending } from "@reactive-dot/core";
import { SignerProvider, useMutation } from "@reactive-dot/react";
import { Binary } from "polkadot-api";

export function Mutation() {
  return (
    <section>
      <header>
        <h3>Mutation</h3>
      </header>
      <AccountSelect>
        {(selectedAccount) => (
          <SignerProvider signer={selectedAccount.polkadotSigner}>
            <RemarkMutation />
          </SignerProvider>
        )}
      </AccountSelect>
    </section>
  );
}

function RemarkMutation() {
  const [remarkState, remark] = useMutation((tx) =>
    tx.System.remark({ remark: Binary.fromText("Hello from reactive-dot!") }),
  );

  return (
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
  );
}
