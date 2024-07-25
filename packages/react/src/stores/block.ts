import { clientAtomFamily } from "./client.js";
import type { ChainId } from "@reactive-dot/core";
import { atom } from "jotai";
import { atomFamily, atomWithObservable } from "jotai/utils";
import { from } from "rxjs";
import { switchMap, map } from "rxjs/operators";

export const finalizedBlockAtomFamily = atomFamily((chainId: ChainId) =>
  atomWithObservable((get) =>
    from(get(clientAtomFamily(chainId))).pipe(
      switchMap((client) => client.finalizedBlock$),
    ),
  ),
);

export const bestBlockAtomFamily = atomFamily((chainId: ChainId) =>
  atomWithObservable((get) =>
    from(get(clientAtomFamily(chainId))).pipe(
      switchMap((client) => client.bestBlocks$),
      map((blocks) => blocks.at(0)!),
    ),
  ),
);

export const blockBodyAtomFamily = atomFamily(
  (param: {
    chainId: ChainId;
    hashOrTag: "best" | "finalized" | `0x${string}`;
  }) =>
    atom(async (get) => {
      const [client, block] = await Promise.all([
        get(clientAtomFamily(param.chainId)),
        param.hashOrTag.startsWith("0x")
          ? { hash: param.hashOrTag as `0x${string}` }
          : get(
              param.hashOrTag === "best"
                ? bestBlockAtomFamily(param.chainId)
                : finalizedBlockAtomFamily(param.chainId),
            ),
      ]);

      return client.getBlockBody(block.hash);
    }),
  (a, b) => a.chainId === b.chainId && a.hashOrTag === b.hashOrTag,
);

export const blockHeaderAtomFamily = atomFamily(
  (param: {
    chainId: ChainId;
    hashOrTag: "best" | "finalized" | `0x${string}`;
  }) =>
    atom(async (get) => {
      const [client, block] = await Promise.all([
        get(clientAtomFamily(param.chainId)),
        param.hashOrTag.startsWith("0x")
          ? { hash: param.hashOrTag as `0x${string}` }
          : get(
              param.hashOrTag === "best"
                ? bestBlockAtomFamily(param.chainId)
                : finalizedBlockAtomFamily(param.chainId),
            ),
      ]);

      return client.getBlockHeader(block.hash);
    }),
  (a, b) => a.chainId === b.chainId && a.hashOrTag === b.hashOrTag,
);
