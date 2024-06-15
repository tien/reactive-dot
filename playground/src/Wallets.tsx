import {
  useAccounts,
  useConnectedWallets,
  useWallets,
} from "@reactive-dot/react";

const Wallets = () => {
  const wallets = useWallets();
  const connectedWallets = useConnectedWallets();

  const accounts = useAccounts();

  return (
    <section>
      <section>
        <header>
          <h2>Wallets</h2>
        </header>
        <ul>
          {wallets.map((wallet) => (
            <li>
              <article>
                <header>
                  <h3>{wallet.name}</h3>
                </header>
                {connectedWallets.includes(wallet) ? (
                  <button onClick={() => wallet.disconnect()}>
                    Disconnect
                  </button>
                ) : (
                  <button onClick={() => wallet.connect()}>Connect</button>
                )}
              </article>
            </li>
          ))}
        </ul>
      </section>
      {accounts.length > 0 && (
        <section>
          <header>
            <h2>Accounts</h2>
          </header>
          <ul>
            {accounts.map((account, index) => (
              <li key={index}>
                <div>
                  <strong>Address:</strong> {account.address}
                </div>
                {account.name && (
                  <div>
                    <strong>Name:</strong> {account.name}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
};

export default Wallets;
