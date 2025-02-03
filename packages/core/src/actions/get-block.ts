import type { PolkadotClient } from "polkadot-api";
import { map } from "rxjs/operators";

export type GetBlockOptions = {
  tag?: "best" | "finalized";
};

export function getBlock<TOptions extends GetBlockOptions>(
  client: PolkadotClient,
  options?: TOptions,
) {
  switch (options?.tag) {
    case "best":
      return client.bestBlocks$.pipe(map((blockInfos) => blockInfos.at(0)!));
    case "finalized":
    default:
      return client.finalizedBlock$;
  }
}
