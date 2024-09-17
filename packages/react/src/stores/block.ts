import { clientAtomFamily } from "./client.js";
import { type ChainId, type Config, getBlock } from "@reactive-dot/core";
import { atomFamily, atomWithObservable } from "jotai/utils";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";

export const finalizedBlockAtomFamily = atomFamily(
  (param: { config: Config; chainId: ChainId }) =>
    atomWithObservable((get) =>
      from(get(clientAtomFamily(param))).pipe(
        switchMap((client) => getBlock(client, { tag: "finalized" })),
      ),
    ),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);

export const bestBlockAtomFamily = atomFamily(
  (param: { config: Config; chainId: ChainId }) =>
    atomWithObservable((get) =>
      from(get(clientAtomFamily(param))).pipe(
        switchMap((client) => getBlock(client, { tag: "best" })),
      ),
    ),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
