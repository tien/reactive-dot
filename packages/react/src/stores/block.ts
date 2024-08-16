import { clientAtomFamily } from "./client.js";
import { type ChainId, getBlock } from "@reactive-dot/core";
import { atomFamily, atomWithObservable } from "jotai/utils";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";

export const finalizedBlockAtomFamily = atomFamily((chainId: ChainId) =>
  atomWithObservable((get) =>
    from(get(clientAtomFamily(chainId))).pipe(
      switchMap((client) => getBlock(client, { tag: "finalized" })),
    ),
  ),
);

export const bestBlockAtomFamily = atomFamily((chainId: ChainId) =>
  atomWithObservable((get) =>
    from(get(clientAtomFamily(chainId))).pipe(
      switchMap((client) => getBlock(client, { tag: "best" })),
    ),
  ),
);
