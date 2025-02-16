import { wellknownChains } from "./wellknown-chains.js";
import { expect, it } from "vitest";

it("should match snapshot", async () =>
  expect(
    Object.fromEntries(
      await Promise.all(
        Object.entries(wellknownChains).map(
          async ([relayChainName, [getRelayChainSpec, parachains]]) => [
            relayChainName,
            [
              JSON.parse((await getRelayChainSpec()).chainSpec)["id"],
              Object.fromEntries(
                await Promise.all(
                  Object.entries(parachains).map(
                    async ([parachainName, getParachainSpec]) => [
                      parachainName,
                      JSON.parse((await getParachainSpec()).chainSpec)["id"],
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    ),
  ).toMatchInlineSnapshot(`
    {
      "kusama": [
        "ksmcc3",
        {
          "kusama_asset_hub": "asset-hub-kusama",
          "kusama_bridge_hub": "bridge-hub-kusama",
          "kusama_encointer": "encointer-kusama",
          "kusama_people": "people-kusama",
        },
      ],
      "paseo": [
        "paseo",
        {
          "paseo_asset_hub": "asset-hub-paseo",
          "paseo_people": "paseo-people",
        },
      ],
      "polkadot": [
        "polkadot",
        {
          "polkadot_asset_hub": "asset-hub-polkadot",
          "polkadot_bridge_hub": "bridge-hub-polkadot",
          "polkadot_collectives": "collectives_polkadot",
          "polkadot_coretime": "coretime-polkadot",
          "polkadot_people": "people-polkadot",
        },
      ],
      "westend": [
        "westend2",
        {
          "westend_asset_hub": "asset-hub-westend",
          "westend_bridge_hub": "bridge-hub-westend",
          "westend_collectives": "collectives_westend",
          "westend_people": "people-westend",
        },
      ],
    }
  `));
