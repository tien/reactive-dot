import { useChainId, useLazyLoadQuery } from "@reactive-dot/react";
import { useMemo } from "react";

export function MultichainQuery() {
  const chainId = useChainId();

  const [parachains, assetHubParaId] = useLazyLoadQuery([
    {
      chainId: undefined,
      query: (builder) => builder.storage("Paras", "Parachains", []),
    },
    {
      chainId: useMemo(() => {
        switch (chainId) {
          case "polkadot":
          case "polkadot_asset_hub":
          case "polkadot_people":
            return "polkadot_asset_hub";
          case "kusama":
          case "kusama_asset_hub":
            return "kusama_asset_hub";
          case "westend":
          case "westend_asset_hub":
            return "westend_asset_hub";
        }
      }, [chainId]),
      query: (builder) => builder.storage("ParachainInfo", "ParachainId", []),
    },
  ]);

  return (
    <dl>
      <dt>Parachain IDs</dt>
      <dd>{parachains.join()}</dd>
      <dt>Asset Hub ID</dt>
      <dd>{assetHubParaId.toString()}</dd>
    </dl>
  );
}
