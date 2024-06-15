import Wallets from "./Wallets";
import { useNativeTokenNumberWithPlanck } from "./useNativeTokenNumber";
import { useBlock, useQuery } from "@reactive-dot/react";

const Playground = () => {
  const block = useBlock();

  const [timestamp, totalIssuance] = useQuery((builder) =>
    builder
      .readStorage("Timestamp", "Now", [])
      .readStorage("Balances", "TotalIssuance", []),
  );

  return (
    <div>
      <Wallets />
      <section>
        <header>
          <h2>Query</h2>
        </header>
        <dl>
          <dt>Current block</dt>
          <dd>{block.number}</dd>

          <dt>Current block timestamp</dt>
          <dd>{new Date(Number(timestamp)).toLocaleString()}</dd>

          <dt>Total issuance</dt>
          <dd>
            {useNativeTokenNumberWithPlanck(totalIssuance).toLocaleString()}
          </dd>
        </dl>
      </section>
    </div>
  );
};

export default Playground;
