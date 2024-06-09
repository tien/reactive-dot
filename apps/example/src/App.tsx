import { kusama, polkadot } from "@polkadot-api/descriptors";
import {
  ReDotChainProvider,
  ReDotProvider,
  useQuery,
} from "@reactive-dot/react";
import {
  ksmcc3 as kusamaChainSpec,
  polkadot as polkadotChainSpec,
} from "polkadot-api/chains";
import { getSmProvider } from "polkadot-api/sm-provider";
import { startFromWorker } from "polkadot-api/smoldot/from-worker";
import SmWorker from "polkadot-api/smoldot/worker?worker";
import { Suspense } from "react";

const Example = () => {
  const [
    currentBlock,
    timestamp,
    totalIssuance,
    activeEra,
    totalValueLocked,
    poolMetadatum,
  ] = useQuery((builder) =>
    builder
      .readStorage("System", "Number", [])
      .readStorage("Timestamp", "Now", [])
      .readStorage("Balances", "TotalIssuance", [])
      .readStorage("Staking", "ActiveEra", [])
      .readStorage("NominationPools", "TotalValueLocked", [])
      .readStorages("NominationPools", "Metadata", [[0], [1], [2], [3], [4]]),
  );

  const totalStaked = useQuery((builder) =>
    activeEra === undefined
      ? undefined
      : builder.readStorage("Staking", "ErasTotalStake", [activeEra.index]),
  );

  return (
    <div>
      <article>
        <h3>Current block</h3>
        <p>
          {currentBlock} @ {new Date(Number(timestamp)).toLocaleString()}
        </p>
      </article>
      <article>
        <h3>Active era</h3>
        <p>{activeEra?.index}</p>
      </article>
      <article>
        <h3>Total issuance</h3>
        <p>{totalIssuance.toString()} planck</p>
      </article>
      <article>
        <h3>Total value staked</h3>
        <p>{totalStaked?.toString()} planck</p>
      </article>
      <article>
        <h3>Total value locked in nomination Pools</h3>
        <p>{totalValueLocked.toString()} planck</p>
      </article>
      <article>
        <h3>First 4 pools</h3>
        {poolMetadatum.map((x, index) => (
          <p key={index}>{x.asText()}</p>
        ))}
      </article>
    </div>
  );
};

const smoldot = startFromWorker(new SmWorker());

const App = () => (
  <ReDotProvider
    config={{
      chains: {
        polkadot: {
          descriptor: polkadot,
          provider: getSmProvider(
            smoldot.addChain({ chainSpec: polkadotChainSpec }),
          ),
        },
        kusama: {
          descriptor: kusama,
          provider: getSmProvider(
            smoldot.addChain({ chainSpec: kusamaChainSpec }),
          ),
        },
      },
    }}
  >
    <ReDotChainProvider chainId="polkadot">
      <Suspense fallback={<h2>Loading Polkadot...</h2>}>
        <h2>Polkadot</h2>
        <Example />
      </Suspense>
    </ReDotChainProvider>
    <ReDotChainProvider chainId="kusama">
      <Suspense fallback={<h2>Loading Kusama...</h2>}>
        <h2>Kusama</h2>
        <Example />
      </Suspense>
    </ReDotChainProvider>
  </ReDotProvider>
);

export default App;
